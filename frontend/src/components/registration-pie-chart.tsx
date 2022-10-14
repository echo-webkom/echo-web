import { type PieLabelRenderProps, PieChart, Pie, Cell, Tooltip } from 'recharts';
import randomColor from 'randomcolor';
import { Center } from '@chakra-ui/react';
import allDegrees from '@utils/degree';
import type { Registration } from '@api/registration';

interface Props {
    registrations: Array<Registration>;
    field: 'degree' | 'year';
}

const RegistrationPieChart = ({ registrations, field }: Props) => {
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

    const regs = field === 'degree' ? regsByDegree : regsByYear;

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
            <text x={x} y={y} fill="black" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                {name}
            </text>
        );
    };

    return (
        <Center>
            <PieChart width={500} height={500}>
                <Pie data={regs} dataKey="value" label={renderCustomizedLabel} labelLine={false} outerRadius={140}>
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
