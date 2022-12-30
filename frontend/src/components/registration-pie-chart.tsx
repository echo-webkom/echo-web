import { type PieLabelRenderProps, PieChart, Pie, Cell, Tooltip } from 'recharts';
import randomColor from 'randomcolor';
import { Center, useColorModeValue, useBreakpointValue } from '@chakra-ui/react';
import { allDegrees } from '@utils/degree';
import type { Registration } from '@api/registration';
import capitalize from '@utils/capitalize';
import { studentGroups } from '@api/dashboard';

interface Props {
    registrations: Array<Registration>;
    field: 'degree' | 'year' | 'studentGroup';
}

const RegistrationPieChart = ({ registrations, field }: Props) => {
    const textColor = useColorModeValue('black', 'white');
    const chartSize = useBreakpointValue([375, 400, 700]) ?? 700;
    const labelFontSize = useBreakpointValue([11, 16, 20]) ?? 20;

    const luminosity = 'bright';

    const regsByDegree = allDegrees.map((degree) => {
        return {
            name: degree,
            value: registrations.filter((reg) => reg.degree === degree).length,
            color: randomColor({ luminosity }),
        };
    });

    const regsByYear = [1, 2, 3, 4, 5].map((year) => {
        return {
            name: `${year}. trinn`,
            value: registrations.filter((reg) => reg.degreeYear === year).length,
            color: randomColor({ luminosity }),
        };
    });

    const regsByStudentGroup = [...studentGroups, 'Ingen'].map((group) => {
        return {
            name: `${capitalize(group)}`,
            value: registrations
                .map((reg) => (reg.memberships.length === 0 ? { ...reg, memberships: ['Ingen'] } : reg))
                .filter((reg) => reg.memberships.includes(group)).length,
            color: randomColor({ luminosity }),
        };
    });

    const regs = (() => {
        if (field === 'degree') return regsByDegree;
        else if (field === 'year') return regsByYear;
        else return regsByStudentGroup;
    })();

    const renderCustomizedLabel = ({
        cx,
        cy,
        midAngle,
        innerRadius,
        outerRadius,
        percent,
        name,
    }: PieLabelRenderProps) => {
        if (
            typeof cx !== 'number' ||
            typeof cy !== 'number' ||
            typeof midAngle !== 'number' ||
            typeof innerRadius !== 'number' ||
            typeof outerRadius !== 'number' ||
            percent === 0
        )
            return null;

        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                fontSize={labelFontSize}
                x={x}
                y={y}
                fill={textColor}
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
            >
                {name}
            </text>
        );
    };

    return (
        <Center>
            <PieChart width={chartSize} height={chartSize}>
                <Pie
                    data={regs}
                    dataKey="value"
                    label={renderCustomizedLabel}
                    labelLine={false}
                    outerRadius={Math.floor(chartSize / 3.9)}
                >
                    {regs.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} fontWeight="bold" />
                    ))}
                </Pie>
                <Tooltip />
            </PieChart>
        </Center>
    );
};

export default RegistrationPieChart;
