import { getMonth } from 'date-fns';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Box } from '@chakra-ui/react';

interface Props {
    n: number;
    children: React.ReactNode;
}

const AnimatedIcons = ({ n, children }: Props) => {
    const month = getMonth(new Date());
    // Only for Halloween, no animated icons for Christmas
    if (month !== 9) return <>{children}</>;

    const keys = [...new Array(n).keys()];
    const folder = '/halloween-icons/';
    const icons = ['ghost.svg', 'pumpkin.svg', 'skull.svg'];

    return (
        <Box w="100%" h="100%">
            <Box position="relative" zIndex={10} w="100%" minHeight="100vh">
                {children}
            </Box>
            <Box position="absolute" w="100%" h="100%" left={0} top={0} overflow="hidden">
                {keys.map((key) => {
                    const xOffset = Math.floor(Math.random() * 95); //between 10% and 90%
                    const yOffset = Math.floor(Math.random() * 95);

                    const icon = icons[Math.floor(Math.random() * icons.length)];
                    return (
                        <AnimatedIcon
                            delay={key * 0.5}
                            repeatDelay={15}
                            xOffset={`${xOffset}%`}
                            yOffset={`${yOffset}%`}
                            key={key}
                            iconSrc={`${folder}${icon}`}
                        />
                    );
                })}
            </Box>
        </Box>
    );
};

const AnimatedIcon = ({
    xOffset,
    yOffset,
    delay,
    repeatDelay,
    iconSrc,
}: {
    xOffset: string;
    yOffset: string;
    delay: number;
    repeatDelay: number;
    iconSrc: string;
}) => (
    <motion.div
        style={{
            position: 'absolute',
            top: xOffset,
            left: yOffset,
            zIndex: 0,
        }}
        initial={{ opacity: 0 }}
        animate={{
            x: '200%',
            y: ['0%', '20%', '-10%', '-5%'],
            opacity: [null, 1, 1, 1, 1, 0],
            rotate: [null, -10, 2, -5],
        }}
        transition={{ delay: delay, repeatDelay: repeatDelay, duration: 5, repeat: Number.POSITIVE_INFINITY }}
    >
        <Image src={iconSrc} alt="" height={50} width={50} />
    </motion.div>
);

export default AnimatedIcons;
