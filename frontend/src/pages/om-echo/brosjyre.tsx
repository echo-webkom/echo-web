import SEO from '@components/seo';
import SidebarWrapper from '@components/sidebar-wrapper';

const BrochurePage = () => {
    return (
        <>
            <SEO title="Brosjyre" />
            <SidebarWrapper>
                <iframe
                    style={{
                        width: '100%',
                        height: '800px',
                    }}
                    src="https://www.visbrosjyre.no/echo/WebView/"
                ></iframe>
            </SidebarWrapper>
        </>
    );
};

export default BrochurePage;
