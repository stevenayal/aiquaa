import { Helmet } from 'react-helmet-async';
import JoinSection from '../components/JoinSection';

const Unite = () => {
  return (
    <>
      <Helmet>
        <title>Unite a AIQUAA - Únete a Nuestra Comunidad</title>
        <meta name="description" content="Únete a AIQUAA, la comunidad líder en automatización, inteligencia artificial y testing de calidad. Colabora, aprende y crece con nosotros." />
        <meta property="og:title" content="Unite a AIQUAA - Únete a Nuestra Comunidad" />
        <meta property="og:description" content="Únete a AIQUAA, la comunidad líder en automatización, inteligencia artificial y testing de calidad. Colabora, aprende y crece con nosotros." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <JoinSection />
    </>
  );
};

export default Unite; 