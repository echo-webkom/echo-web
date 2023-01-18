import { XAxis, YAxis, Tooltip, CartesianGrid, Line, LineChart, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface Props {
    data: Array<{ key: number; value: number }>;
}

const RegistrationsOverTime = ({ data }: Props) => {
    return (
        <ResponsiveContainer width="100%" height={400}>
            <LineChart width={500} height={300} data={data}>
                <XAxis
                    dataKey="key"
                    scale="linear"
                    tickFormatter={(value) => format(value, 'HH:mm:ss')}
                    domain={['dataMin', 'dataMax']}
                />
                <YAxis allowDecimals={false} domain={['dataMin', 'dataMax']} />
                <Tooltip
                    labelFormatter={(label) => format(label, 'dd.MM HH:mm:ss')}
                    formatter={(value) => [value, 'Antall påmeldinger']}
                    contentStyle={{
                        backgroundColor: 'white',
                        color: 'black',
                    }}
                />
                <CartesianGrid strokeDasharray="3 3" scale="linear" />
                <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth="1.5" />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default RegistrationsOverTime;
