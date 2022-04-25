import theme from '@app/variables/theme';
import { useMediaQuery } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { BarChart } from '../BarChart'
import moment from 'moment'
import { shortenNumber } from '@app/util/markets';

const months = [...Array(12).keys()];

export const FedBarChart = ({ chartData, maxChartWidth = 900, ...props }: { chartData: any, maxChartWidth?: number }) => {
    const [chartWidth, setChartWidth] = useState<number>(maxChartWidth);
    const [isLargerThan] = useMediaQuery(`(min-width: ${maxChartWidth}px)`)

    useEffect(() => {
        setChartWidth(isLargerThan ? maxChartWidth : (screen.availWidth || screen.width) - 40)
    }, [isLargerThan]);

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    const barChartData = ['Profit'].map(event => {
        return months.map(month => {
            const date = Date.UTC(currentYear, currentMonth - 11 + month);
            const filterMonth = new Date(date).getMonth();
            const filterYear = new Date(date).getFullYear();
            const y = chartData.filter(d => d.month === filterMonth && d.year === filterYear).reduce((p, c) => p + c.profit, 0);

            return {
                label: `${event}s: ${shortenNumber(y, 2, true)}`,
                x: moment(date).format(chartWidth <= 400 ? 'MMM' : 'MMM-YY'),
                y,
            }
        });
    })

    return (
        <BarChart
            width={chartWidth}
            height={300}
            title="Monthly profits for the last 12 months"
            groupedData={barChartData}
            colorScale={[theme.colors.secondary]}
            isDollars={true}
            {...props}
        />
    )
}