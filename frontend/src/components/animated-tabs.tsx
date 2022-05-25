import React, { useState } from 'react';
import { motion, AnimatePresence, AnimateSharedLayout } from 'framer-motion';

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

const AnimatedTabs = ({ tabs, setState }: Props) => {
    const [[page, direction], setPage] = useState([0, 0]);

    return (
        <>
            <AnimateSharedLayout>
                <ul
                    style={{
                        display: 'flex',
                        gap: '16px',
                        color: 'white',
                        padding: 0,
                        position: 'relative',
                        listStyle: 'none',
                    }}
                >
                    {tabs.map(({ title, value }, i) => {
                        const isActive = i === page;
                        return (
                            <li
                                key={i}
                                className={isActive ? 'active-header' : ''}
                                onClick={() => {
                                    setPage([i, i - page]);
                                    if (setState && value) {
                                        setState(value);
                                    }
                                }}
                            >
                                <h4>{title}</h4>
                                {isActive && (
                                    <motion.div
                                        style={{
                                            width: '100%',
                                            height: '2px',
                                            borderRadius: '2px',
                                            background: '#99ccff',
                                            position: 'relative',
                                            zIndex: 1,
                                        }}
                                        layoutId="underline"
                                    />
                                )}
                            </li>
                        );
                    })}
                    <div
                        style={{
                            width: '100%',
                            height: '2px',
                            borderRadius: '2px',
                            background: 'ff9900',
                            position: 'absolute',
                            bottom: 0,
                        }}
                    />
                </ul>
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
        </>
    );
};

export default AnimatedTabs;
