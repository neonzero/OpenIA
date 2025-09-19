import React, { useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import { useRisks } from '../api/risks';

const scaleLabels = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost certain'];
const impactLabels = ['Insignificant', 'Minor', 'Moderate', 'Major', 'Severe'];

const toIndex = (value: number) => Math.max(0, Math.min(4, Math.round(value) - 1));

export const RiskMatrix: React.FC = () => {
  const { risks } = useRisks();
  const svgRef = useRef<SVGSVGElement | null>(null);

  const matrix = useMemo(() => {
    const base = Array.from({ length: 5 }, () => Array(5).fill(0));
    for (const risk of risks) {
      const likelihoodIndex = toIndex(risk.inherentRisk);
      const impactIndex = toIndex(risk.residualRisk);
      base[4 - impactIndex][likelihoodIndex] += 1;
    }
    return base;
  }, [risks]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const size = 400;
    const cellSize = size / 5;

    svg.attr('viewBox', `0 0 ${size + 120} ${size + 60}`);
    svg.selectAll('*').remove();

    const colorScale = d3
      .scaleSequential<number>()
      .domain([0, d3.max(matrix.flat()) || 1])
      .interpolator(d3.interpolateYlOrRd);

    const group = svg.append('g').attr('transform', 'translate(100, 20)');

    matrix.forEach((row, rowIndex) => {
      row.forEach((value, columnIndex) => {
        const x = columnIndex * cellSize;
        const y = rowIndex * cellSize;
        group
          .append('rect')
          .attr('x', x)
          .attr('y', y)
          .attr('width', cellSize - 2)
          .attr('height', cellSize - 2)
          .attr('rx', 8)
          .attr('ry', 8)
          .attr('fill', colorScale(value));

        group
          .append('text')
          .attr('x', x + cellSize / 2)
          .attr('y', y + cellSize / 2)
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')
          .attr('fill', value > (d3.max(matrix.flat()) || 1) / 2 ? '#fff' : '#1f2933')
          .style('font-size', '0.85rem')
          .text(value ? value.toString() : '');
      });
    });

    scaleLabels.forEach((label, index) => {
      svg
        .append('text')
        .attr('x', 110 + index * cellSize)
        .attr('y', size + 40)
        .attr('text-anchor', 'middle')
        .style('font-size', '0.85rem')
        .text(label);
    });

    impactLabels.forEach((label, index) => {
      svg
        .append('text')
        .attr('x', 20)
        .attr('y', 40 + index * cellSize)
        .attr('text-anchor', 'end')
        .style('font-size', '0.85rem')
        .text(label);
    });

    svg
      .append('text')
      .attr('x', size / 2 + 100)
      .attr('y', size + 55)
      .attr('text-anchor', 'middle')
      .style('font-weight', '600')
      .text('Likelihood');

    svg
      .append('text')
      .attr('transform', `translate(20, ${size / 2 + 20}) rotate(-90)`)
      .attr('text-anchor', 'middle')
      .style('font-weight', '600')
      .text('Impact');
  }, [matrix]);

  return (
    <section>
      <header style={{ marginBottom: '2rem' }}>
        <h1>Risk heat matrix</h1>
        <p>Visualise the distribution of inherent and residual risk to prioritise assurance activities.</p>
      </header>
      <div role="img" aria-label="Risk heat map showing distribution of risks by likelihood and impact" style={{ background: '#fff', padding: '1rem', borderRadius: '1rem', boxShadow: '0 15px 40px rgba(15, 23, 42, 0.08)' }}>
        <svg ref={svgRef} width="100%" height="100%" aria-hidden="true" />
      </div>
      <p style={{ marginTop: '1rem', color: '#4b5563' }}>
        Each tile highlights the number of risks falling within the corresponding likelihood and impact intersection.
      </p>
    </section>
  );
};
