import { shortenNumber } from '@app/util/markets';
import { VictoryChart, VictoryLabel, VictoryAxis, VictoryArea, VictoryTheme, VictoryClipContainer, VictoryVoronoiContainer, VictoryAreaProps, VictoryAxisProps, VictoryLabelProps } from 'victory';
import moment from 'moment'
import { Box, useMediaQuery } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { FlyoutTooltip } from './FlyoutTooltip';

type Props = { x: number, y: number }[]

const defaultAxisStyle: VictoryAxisProps["style"] = {
    tickLabels: { fill: '#fff', fontFamily: 'Inter', fontSize: '12px' },
    grid: {
        stroke: '#666666aa',
        strokeDasharray: '4 4',
    }
}

const strokeColors = {
    primary: '#8881c9',
    secondary: '#00FF8A',
    info: '#43a0e2',
}

export type AreaChartProps = {
    data: Props,
    title?: string,
    width?: number,
    height?: number,
    showLabels?: boolean,
    showTooltips?: boolean,
    showMaxY?: boolean,
    interpolation?: VictoryAreaProps["interpolation"],
    axisStyle?: VictoryAxisProps["style"],
    domainYpadding?: number | 'auto',
    isDollars?: boolean,
    mainColor?: 'primary' | 'secondary' | 'info',
    titleProps?: VictoryLabelProps,
};

export const AreaChart = ({
    data,
    title,
    width = 900,
    height = 300,
    showLabels = false,
    showTooltips = false,
    showMaxY = true,
    interpolation = 'basis',
    axisStyle = defaultAxisStyle,
    domainYpadding = 0,
    mainColor = 'primary',
    isDollars = false,
    titleProps,
}: AreaChartProps) => {
    const [isLargerThan] = useMediaQuery('(min-width: 900px)');
    const [rightPadding, setRightPadding] = useState(50);
    const maxY = data.length > 0 ? Math.max(...data.map(d => d.y)) : 95000000;

    const _yPad = domainYpadding === 'auto' ? maxY * 0.1 : domainYpadding;

    useEffect(() => {
        setRightPadding(isLargerThan ? 50 : 20)
    }, [isLargerThan]);

    return (
        <Box
            width={width}
            height={height}
            position="relative"
        >
            <VictoryChart
                width={width}
                height={height}
                theme={VictoryTheme.grayscale}
                animate={{ duration: 500 }}
                scale={{ x: "time" }}
                padding={{ top: 50, bottom: 50, left: 50, right: rightPadding }}
                containerComponent={!showTooltips ? undefined :
                    <VictoryVoronoiContainer
                        mouseFollowTooltips={true}
                        voronoiDimension="x"
                        labelComponent={<FlyoutTooltip />}
                        labels={({ datum }) => {
                            return (
                                moment(datum.x).format('MMM Do YYYY') + '\n' + shortenNumber(datum.y, 2, isDollars)
                            )
                        }}
                    />
                }
            >
                {
                    !!title && <VictoryLabel text={title} style={{ fill: 'white', fontFamily: 'Inter' }} x={Math.floor(width / 2)} y={30} textAnchor="middle" {...titleProps} />
                }
                <VictoryAxis style={axisStyle} dependentAxis tickFormat={(t) => shortenNumber(t, 0, isDollars)} />
                <VictoryAxis style={axisStyle} />
                <VictoryArea
                    domain={{ y: [0, maxY + _yPad] }}
                    groupComponent={<VictoryClipContainer clipId="area-chart" />}
                    data={data}
                    labelComponent={
                        <VictoryLabel
                            dx={-rightPadding - 20}
                            textAnchor="start"
                            verticalAnchor="start"
                        />
                    }
                    labels={
                        ({ data, index }) => {
                            const isMax = (maxY === data[index].y && index > 0 && maxY !== data[index - 1].y);
                            return showLabels || (isMax && showMaxY) ? `${isMax && 'High: '}${shortenNumber(data[index].y, 2)}` : ''
                        }
                    }
                    style={{
                        data: { fillOpacity: 0.9, fill: `url(#${mainColor}-gradient)`, stroke: strokeColors[mainColor], strokeWidth: 1 },
                        labels: { fill: 'white', fontSize: '12px', fontFamily: 'Inter' }
                    }}
                    interpolation={interpolation}
                />
            </VictoryChart>
        </Box >
    )
}