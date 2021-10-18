import Image from 'next/image';
import { motion } from 'framer-motion';
import { Box } from '@chakra-ui/react';

interface Props {
    n: number;
    children: React.ReactNode;
}

const AnimatedIcons = ({ n, children }: Props): JSX.Element => {
    const keys = Array.from(Array(n).keys());

    return (
        <Box w="100%" h="100%">
            <Box position="relative" zIndex={10}>
                {children}
            </Box>
            <Box position="absolute" w="100%" h="100%" left={0} top={0} overflow="hidden">
                {keys.map((key) => {
                    const x_offset = Math.floor(Math.random() * 95); //between 10% and 90%
                    const y_offset = Math.floor(Math.random() * 95);
                    return (
                        <AnimatedIcon
                            delay={key}
                            repeat_delay={n}
                            x_offset={`${x_offset}%`}
                            y_offset={`${y_offset}%`}
                            key={key}
                        />
                    );
                })}
            </Box>
        </Box>
    );
};

const AnimatedIcon = ({
    x_offset,
    y_offset,
    delay,
    repeat_delay,
}: {
    x_offset: string;
    y_offset: string;
    delay: number;
    repeat_delay: number;
}): JSX.Element => (
    <motion.div
        style={{
            position: 'absolute',
            top: x_offset,
            left: y_offset,
            zIndex: 0,
        }}
        initial={{ opacity: 0 }}
        animate={{
            x: '200%',
            y: ['0%', '20%', '-10%', '-5%'],
            opacity: [null, 1, 1, 1, 1, 0],
            rotate: [null, -10, 2, -5],
        }}
        transition={{ delay: delay, repeatDelay: repeat_delay, duration: 5, repeat: Infinity }}
    >
        <Image src="/ghost.svg" alt="" height={50} width={50} />
    </motion.div>
);

export default AnimatedIcons;
