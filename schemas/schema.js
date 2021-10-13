import createSchema from 'part:@sanity/base/schema-creator';
import schemaTypes from 'all:part:@sanity/base/schema-type';
import Break from './Break';
import PortableText from './PortableText';
import Author from './Author';
import Post from './Post';
import Event from './Event';
import Bedpres from './Bedpres';
import MeetingMinute from './MeetingMinute';
import Profile from './Profile';
import Role from './Role';
import StudentGroup from './StudentGroup';
import AdditionalQuestion from './AdditionalQuestion';
import SpotRange from './SpotRange';
import Happening from './Happening';

export default createSchema({
    name: 'default',
    types: schemaTypes.concat([
        Break,
        PortableText,
        Author,
        Post,
        Event,
        Bedpres,
        MeetingMinute,
        Profile,
        Role,
        StudentGroup,
        AdditionalQuestion,
        SpotRange,
        Happening,
    ]),
});
