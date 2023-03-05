import { getCliClient } from 'sanity/cli';

const client = getCliClient({ apiVersion: '2021-08-21', dataset: 'migrate-test' });

const fetchDocuments = () =>
    client.fetch(`
    *[(_type == "happening") && defined(registrationDate) && "reference" in spotRanges[]._type][0...100] {
      _id,
      _rev,
      spotRanges[] -> {
        minDegreeYear,
        maxDegreeYear,
        spots,
        "_key": _id,
      },
    }
  `);

const buildPatches = (docs) =>
    docs.map((doc) => {
        const newSpotRanges = doc.spotRanges.map((spotRange) => {
            return {
                minDegreeYear: spotRange.minDegreeYear,
                maxDegreeYear: spotRange.maxDegreeYear,
                spots: spotRange.spots,
                _key: spotRange._key,
            };
        });

        return {
            id: doc._id,
            patch: {
                set: {
                    spotRanges: newSpotRanges,
                },
                ifRevisionID: doc._rev,
            },
        };
    });

const createTransaction = (patches) =>
    patches.reduce((tx, patch) => tx.patch(patch.id, patch.patch), client.transaction());

const commitTransaction = (tx) => tx.commit();

const migrateNextBatch = async () => {
    const documents = await fetchDocuments();
    const patches = buildPatches(documents);

    if (patches.length === 0) {
        console.log('No more documents to migrate');
        return null;
    }

    console.log(
        `Migrating batch:\n %s`,
        patches.map((patch) => `${patch.id} => ${JSON.stringify(patch.patch)}`).join('\n'),
    );

    console.log('COMMITTING TRANSACTION NOW');

    const transaction = createTransaction(patches);
    console.log('am waiting');
    await commitTransaction(transaction);
    console.log('am done');
    return migrateNextBatch();
};

migrateNextBatch().catch((err) => {
    console.log(err);
    process.exit(1);
});
