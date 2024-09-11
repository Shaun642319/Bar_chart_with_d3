const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json'
const req = new XMLHttpRequest();
let response;
let data = [];

let heightScale;
let xScale; 
let xAxisScale;
let yAxisScale;

const width = 800;
const height = 400;
const padding = 40;

const svg = d3.select('svg');

const drawCanvas = () => {
  svg.attr('width', width);
  svg.attr('height', height);
}

const generateScale = () => {
  heightScale = d3.scaleLinear()
                   .domain([0, d3.max(data, (d) => {
                     return d[1];
                   })])
                   .range([0, height - (2 * padding)])
  
  xScale = d3.scaleLinear()
              .domain([0, data.length - 1])
              .range([padding, width - padding * 1.1])
  
  const datesArray = data.map((d) => {
    return new Date(d[0])
  })
  
  xAxisScale = d3.scaleTime()
                  .domain([d3.min(datesArray), d3.max(datesArray)])
                  .range([padding, width - padding])
  
  yAxisScale = d3.scaleLinear()
                  .domain([0, d3.max(data, (d) => {
                    return d[1];
                  })])
                  .range([height - padding, padding])
}

const drawBars = () => {
  const tooltip = d3.select('#tooltip')
  
  svg.selectAll('rect')
     .data(data)
     .enter()
     .append('rect')
     .attr('x', (d, i) => xScale(i))
     .attr('y', (d) => height - heightScale(d[1]) - padding)
     .attr('width', (width - 2 * padding) / data.length)
     .attr('height', (d) => heightScale(d[1]))
     .attr('class', 'bar')
     .attr('data-date', (d) => d[0])
     .attr('data-gdp', (d) => d[1])
     .style('fill', 'blue')
     .on('mouseover', function(event, d) {
        const date = new Date(d[0]);
        const year = date.getFullYear();
        const month = date.getMonth();
        let quarter;
        const formattedCurrency = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(d[1])
        
        if(month < 3){
          quarter = 'Q1'
        } else if(month < 6) {
          quarter = 'Q2'
        } else if(month < 9) {
          quarter = 'Q3'
        } else {
          quarter = 'Q4'
        }
         
        tooltip.transition().duration(200).style('opacity', 0.9)
        tooltip.html(`${year} ${quarter}<br>${formattedCurrency} Billion`)
               .style('left', (event.pageX + 10) + 'px')
               .style('top', (event.pageY - 28) + 'px')
               .attr('data-date', d[0])
        
        d3.select(this)
          .style('fill', 'orange')
  })
    .on('mouseout', function() {
      tooltip.transition().duration(500).style('opacity', 0)
      
      d3.select(this)
        .style('fill', 'blue')
  })
}

const generateAxes = () => {
  const xAxis = d3.axisBottom(xAxisScale);
  
  svg.append('g')
     .call(xAxis)
     .attr('id', 'x-axis')
     .attr('transform', 'translate(0, '+ (height - padding) + ')')
  
  const yAxis = d3.axisLeft(yAxisScale);
  
  svg.append('g')
     .call(yAxis)
     .attr('id', 'y-axis')
     .attr('transform', 'translate(' + padding + ', 0)')
}

req.open('GET', url, true)
req.onload = () => {
  response = JSON.parse(req.responseText)
  data = response.data
  drawCanvas();
  generateScale();
  drawBars();
  generateAxes();
};
req.send();
