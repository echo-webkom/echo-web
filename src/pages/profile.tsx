import Markdown from 'markdown-to-jsx';
import React, {useState, useEffect} from 'react';
import bedriftspresentasjon from '../../public/static/for-bedrifter/bedriftspresentasjon.md';
import forBedrifter from '../../public/static/for-bedrifter/for-bedrifter.md';
import stillingsutlysninger from '../../public/static/for-bedrifter/stillingsutlysninger.md';
import SEO from '../components/seo';
import InfoPanels from '../components/info-panels';
import MapMarkdownChakra from '../markdown';
import { UserAPI, User, isErrorMessage } from '../lib/api'

const ProfilePage = (): JSX.Element => {
    const [user, setUser] = useState<User|undefined> (undefined)
    const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:8080';

    useEffect(()=>{
        const fetchUser = async ()=>{
            const result = await UserAPI.getUser(backendUrl)
            if (isErrorMessage(result)){
                console.log(result)
            } else {
                setUser(result)
            }
        }
        fetchUser()
    },[])
    console.log(user)

    return (
        <>
            <SEO title="Profile page" />
            <h1>dette er en profile side</h1>
        </>
    );
};

export default ProfilePage;
