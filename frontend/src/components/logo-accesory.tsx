import { Box } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface Props {
    iconSrc: string;
    w: number;
    h: number;
}

const LogoAccesory = ({ iconSrc, w, h }: Props) => {
    return (
        <Box display={{ base: 'none', md: 'block' }}>
            <motion.div
                style={{
                    position: 'absolute',
                    left: 114,
                    top: 7,
                    transform: 'rotate(-20deg)',
                }}
            >
                <Image src={iconSrc} alt="" width={w} height={h} />
            </motion.div>
        </Box>
    );
};

export default LogoAccesory;
