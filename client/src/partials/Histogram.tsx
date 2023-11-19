import { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";

const MARGIN = { top: 30, right: 30, bottom: 0, left: 50 };
const BUCKET_NUMBER = 22;
const BUCKET_PADDING = 10;

type HistogramProps = {
  width: number;
  height: number;
  data: number[];
};

export const Histogram = ({ width, height, data }: HistogramProps) => {
  const axesRef = useRef(null);
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  const xScale = useMemo(() => {
    const max = Math.max(...data);
    return d3
      .scaleLinear()
      .domain([0.3, 1]) // Adjusted domain for xScale
      .range([0, boundsWidth]);
  }, [data, boundsWidth]);

  const buckets = useMemo(() => {
    const bucketGenerator = d3
      .bin()
      .value((d) => d)
      .domain(xScale.domain())
      .thresholds(xScale.ticks(BUCKET_NUMBER));
    return bucketGenerator(data);
  }, [xScale]);

  const yScale = useMemo(() => {
    const max = Math.max(...buckets.map((bucket) => bucket.length));
    return d3.scaleLinear().range([boundsHeight, 0]).domain([0, max]).nice();
  }, [buckets, boundsHeight]);

  // Render the X axis using d3.js, not react
  useEffect(() => {
    const svgElement = d3.select(axesRef.current);
    svgElement.selectAll("*").remove();

    const xAxisGenerator = d3.axisBottom(xScale);
    svgElement
      .append("g")
      .attr("transform", `translate(0, ${boundsHeight})`)
      .call(xAxisGenerator);

    // Omit the Y-axis generator if you want to remove the vertical indicator (Y-axis)
  }, [xScale, boundsHeight]);

  const allRects = buckets.map((bucket, i) => {
    return (
      <rect
        key={i}
        fill="#808080"
        x={xScale(bucket.x0) + BUCKET_PADDING / 2}
        width={xScale(bucket.x1) - xScale(bucket.x0) - BUCKET_PADDING}
        y={yScale(bucket.length)}
        height={boundsHeight - yScale(bucket.length)}
      />
    );
  });

  return (
    <svg width={width} height={height} className="mx-auto">
      <g
        width={boundsWidth}
        height={boundsHeight}
        transform={`translate(${MARGIN.left}, ${MARGIN.top})`}
      >
        {allRects}
      </g>
      <g
        width={boundsWidth}
        height={boundsHeight}
        ref={axesRef}
        transform={`translate(${MARGIN.left}, ${MARGIN.top})`}
      />
    </svg>
  );
};
