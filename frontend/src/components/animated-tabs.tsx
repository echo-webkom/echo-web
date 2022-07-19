import React, { useState } from 'react';
import { motion, AnimatePresence, AnimateSharedLayout } from 'framer-motion';
import { ListItem, Text, UnorderedList } from '@chakra-ui/react';

const variants = {
    enter: (direction: number) => {
        return {
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
        };
    },
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1,
    },
    exit: (direction: number) => {
        return {
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
        };
    },
};

type Tab = { title: string; value?: string; tabBody: any };

interface Props {
    tabs: Array<Tab>;
    state?: string;
    setState?(usedState: string): void;
}

const AnimatedTabs = ({ tabs, state, setState }: Props) => {
    const initialPage = tabs.findIndex((tab) => tab.value === state);
    const [[page, direction], setPage] = useState([initialPage, 0]);

    return (
        <AnimateSharedLayout>
            <UnorderedList listStyleType="none" display="flex" gap="1.5rem" p="0" m="0" position="relative">
                {tabs.map(({ title, value }, i) => {
                    const isActive = i === page;
                    return (
                        <ListItem
                            key={i}
                            _hover={{ cursor: 'pointer' }}
                            onClick={() => {
                                setPage([i, i - page]);
                                if (setState && value) {
                                    setState(value);
                                }
                            }}
                        >
                            <Text>{title}</Text>
                            {isActive && (
                                <motion.div
                                    style={{
                                        width: '100%',
                                        height: '2px',
                                        borderRadius: '2px',
                                        background: '#98e5f0',
                                        position: 'relative',
                                        zIndex: 1,
                                    }}
                                    layoutId="underline"
                                />
                            )}
                        </ListItem>
                    );
                })}
            </UnorderedList>
            <AnimatePresence initial={false} custom={direction}>
                <motion.section
                    key={page}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: 'spring', stiffness: 300, damping: 30, duration: 2 },
                        opacity: { duration: 0.2 },
                    }}
                >
                    {tabs[page].tabBody}
                </motion.section>
            </AnimatePresence>
        </AnimateSharedLayout>
    );
};

export default AnimatedTabs;
