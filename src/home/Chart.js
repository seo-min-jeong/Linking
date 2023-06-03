import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Cell } from 'recharts';

const Chart = (props) => {
    const { graph } = props
    const chartData = graph || [];

    const data = chartData.map((item) => ({
        name: item.userName,
        num: item.completionRatio,
        color: item.completionRatio,
        count: item.completeAssign
    }));

    return (
        <BarChart width={550} height={230} data={data}>
            <Bar dataKey="num" >
            {data.map((item, index) => (
                <Cell key={index} fill={item.num < 50 ? 'rgb(255, 65, 65, 0.9)' : 'rgb(71, 203, 255, 0.7)'}>
                {item.num.toString()}
                </Cell>
            ))}
            </Bar>
            <XAxis dataKey="name" fontSize={'14px'} />
            <YAxis unit="%" domain={[0, 100]} fontSize={'10px'} />
        </BarChart>
    );
};

export default Chart;