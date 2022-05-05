import createSchema from 'part:@sanity/base/schema-creator';
import schemaTypes from 'all:part:@sanity/base/schema-type';
import Author from './Author';
import Post from './Post';
import MeetingMinute from './MeetingMinute';
import Profile from './Profile';
import StudentGroup from './StudentGroup';
import AdditionalQuestion from './AdditionalQuestion';
import SpotRange from './SpotRange';
import Happening from './Happening';
import JobAdvert from './JobAdvert';
import Banner from './Banner';
import StaticInfo from './StaticInfo';

export default createSchema({
    name: 'default',
    types: schemaTypes.concat([
        Happening,
        Post,
        AdditionalQuestion,
        SpotRange,
        MeetingMinute,
        Author,
        Profile,
        StudentGroup,
        JobAdvert,
        Banner,
        StaticInfo,
    ]),
});
