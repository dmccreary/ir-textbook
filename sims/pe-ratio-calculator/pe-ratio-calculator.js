// P/E Ratio Calculator MicroSim
// This simulation helps students understand Price-to-Earnings ratios
// and their use in company valuation and investment analysis

// Canvas dimensions - REQUIRED structure
let canvasWidth = 800;
let drawHeight = 480;
let controlHeight = 150;
let canvasHeight = drawHeight + controlHeight;
let margin = 25;
let sliderLeftMargin = 150;
let defaultTextSize = 16;

// Valuation parameters
let stockPrice = 100;
let earningsPerShare = 5;
let peRatio = 0;
let industryAvgPE = 20;

// Sample companies with typical metrics
const sampleCompanies = {
  tech: {
    name: "High-Growth Tech",
    price: 150,
    eps: 4,
    industryPE: 35,
    description: "Fast-growing software company"
  },
  retail: {
    name: "Established Retail",
    price: 45,
    eps: 3,
    industryPE: 15,
    description: "Mature retail chain"
  },
  utility: {
    name: "Stable Utility",
    price: 60,
    eps: 5,
    industryPE: 12,
    description: "Regulated utility company"
  },
  startup: {
    name: "Unprofitable Startup",
    price: 80,
    eps: -2,
    industryPE: 25,
    description: "Growth-stage tech (negative earnings)"
  }
};

// UI Elements
let priceSlider;
let epsSlider;
let industryPESlider;
let companyButtons = {};

function setup() {
  const canvas = createCanvas(canvasWidth, canvasHeight);
  let container = document.querySelector('main');
  if (container) {
    canvas.parent(container);
  }

  // Create stock price slider
  priceSlider = createSlider(10, 500, stockPrice, 1);
  priceSlider.position(sliderLeftMargin, drawHeight + 15);
  priceSlider.size(canvasWidth - sliderLeftMargin - margin);
  priceSlider.input(calculatePE);

  // Create EPS slider (can be negative)
  epsSlider = createSlider(-10, 50, earningsPerShare, 0.5);
  epsSlider.position(sliderLeftMargin, drawHeight + 50);
  epsSlider.size(canvasWidth - sliderLeftMargin - margin);
  epsSlider.input(calculatePE);

  // Create industry average P/E slider
  industryPESlider = createSlider(5, 60, industryAvgPE, 1);
  industryPESlider.position(sliderLeftMargin, drawHeight + 85);
  industryPESlider.size(canvasWidth - sliderLeftMargin - margin);

  // Create sample company buttons
  let buttonY = drawHeight + 120;
  let buttonX = 20;

  companyButtons.tech = createButton('Tech Co');
  companyButtons.tech.position(buttonX, buttonY);
  companyButtons.tech.mousePressed(() => loadCompany('tech'));
  styleButton(companyButtons.tech);
  buttonX += 100;

  companyButtons.retail = createButton('Retail Co');
  companyButtons.retail.position(buttonX, buttonY);
  companyButtons.retail.mousePressed(() => loadCompany('retail'));
  styleButton(companyButtons.retail);
  buttonX += 100;

  companyButtons.utility = createButton('Utility Co');
  companyButtons.utility.position(buttonX, buttonY);
  companyButtons.utility.mousePressed(() => loadCompany('utility'));
  styleButton(companyButtons.utility);
  buttonX += 100;

  companyButtons.startup = createButton('Startup');
  companyButtons.startup.position(buttonX, buttonY);
  companyButtons.startup.mousePressed(() => loadCompany('startup'));
  styleButton(companyButtons.startup);

  // Initial calculation
  calculatePE();

  describe('Interactive P/E ratio calculator showing relationship between stock price, earnings, and valuation multiples', LABEL);
}

function draw() {
  updateCanvasSize();

  // Drawing area background
  fill('aliceblue');
  noStroke();
  rect(0, 0, width, drawHeight);

  // Control area background
  fill('white');
  rect(0, drawHeight, width, controlHeight);

  // Title
  fill('black');
  textSize(32);
  textAlign(CENTER, TOP);
  text('P/E Ratio Calculator', canvasWidth / 2, 15);

  // Draw main visualization
  drawPEVisualization();

  // Draw control labels
  drawControlLabels();

  // Reset text defaults
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  stroke(0);
}

function drawPEVisualization() {
  let centerX = canvasWidth / 2;
  let topY = 70;

  // Display formula
  textSize(18);
  textAlign(CENTER, TOP);
  fill(60);
  text('P/E Ratio = Stock Price ÷ Earnings Per Share', centerX, topY);

  // Display calculation
  textSize(20);
  fill(0);
  let formulaY = topY + 35;

  if (earningsPerShare > 0) {
    text(`P/E = $${stockPrice.toFixed(2)} ÷ $${earningsPerShare.toFixed(2)} = ${peRatio.toFixed(2)}`,
         centerX, formulaY);
  } else if (earningsPerShare < 0) {
    text(`P/E = $${stockPrice.toFixed(2)} ÷ $${earningsPerShare.toFixed(2)} = N/A (negative earnings)`,
         centerX, formulaY);
  } else {
    text(`P/E = $${stockPrice.toFixed(2)} ÷ $${earningsPerShare.toFixed(2)} = N/A (zero earnings)`,
         centerX, formulaY);
  }

  // Large P/E display
  let peDisplayY = formulaY + 50;
  if (earningsPerShare > 0) {
    textSize(64);
    fill(getPEColor());
    text(peRatio.toFixed(1), centerX, peDisplayY);

    textSize(18);
    fill(100);
    text('Price-to-Earnings Ratio', centerX, peDisplayY + 70);
  } else {
    textSize(48);
    fill(200, 0, 0);
    text('N/A', centerX, peDisplayY + 10);

    textSize(16);
    fill(100);
    text('(P/E ratio not meaningful with negative earnings)', centerX, peDisplayY + 65);
  }

  // Comparison bar chart
  if (earningsPerShare > 0) {
    drawComparisonChart();
  }

  // Valuation interpretation
  drawValuationInterpretation();
}

function drawComparisonChart() {
  let chartX = 50;
  let chartY = 330;
  let chartWidth = canvasWidth - 100;
  let chartHeight = 80;
  let maxPE = Math.max(peRatio, industryAvgPE, 60);

  // Chart title
  textSize(16);
  textAlign(LEFT, BOTTOM);
  fill(0);
  text('Comparison to Industry Average', chartX, chartY - 5);

  // Draw bars
  let barHeight = 30;

  // Company P/E bar
  let companyBarWidth = map(peRatio, 0, maxPE, 0, chartWidth);
  fill(getPEColor());
  noStroke();
  rect(chartX, chartY, companyBarWidth, barHeight, 5);

  // Label
  fill(0);
  textAlign(LEFT, CENTER);
  text(`Your Company: ${peRatio.toFixed(1)}`, chartX + 5, chartY + barHeight/2);

  // Industry average bar
  let industryBarWidth = map(industryAvgPE, 0, maxPE, 0, chartWidth);
  fill(100, 100, 200);
  rect(chartX, chartY + barHeight + 10, industryBarWidth, barHeight, 5);

  // Label
  fill(0);
  text(`Industry Avg: ${industryAvgPE.toFixed(1)}`, chartX + 5, chartY + barHeight + 10 + barHeight/2);

  // Scale markers
  stroke(200);
  strokeWeight(1);
  textSize(12);
  textAlign(CENTER, TOP);
  fill(100);
  for (let i = 0; i <= maxPE; i += 10) {
    let x = chartX + map(i, 0, maxPE, 0, chartWidth);
    line(x, chartY - 3, x, chartY + chartHeight);
    text(i, x, chartY + chartHeight + 2);
  }
}

function drawValuationInterpretation() {
  if (earningsPerShare <= 0) return;

  let interpretX = canvasWidth / 2;
  let interpretY = 250;

  textSize(18);
  textAlign(CENTER, CENTER);

  let difference = peRatio - industryAvgPE;
  let percentDiff = (difference / industryAvgPE) * 100;

  let interpretation = '';
  let interpretColor = color(0);

  if (Math.abs(percentDiff) < 10) {
    interpretation = 'Fairly Valued';
    interpretColor = color(100, 150, 100);
  } else if (percentDiff > 0) {
    interpretation = `Potentially Overvalued (+${percentDiff.toFixed(1)}% vs industry)`;
    interpretColor = color(200, 100, 50);
  } else {
    interpretation = `Potentially Undervalued (${percentDiff.toFixed(1)}% vs industry)`;
    interpretColor = color(50, 100, 200);
  }

  fill(interpretColor);
  text(interpretation, interpretX, interpretY);

  // Context note
  textSize(14);
  fill(100);
  text('Note: Higher P/E may indicate growth expectations; lower P/E may suggest value opportunity or concerns',
       interpretX, interpretY + 30);
}

function drawControlLabels() {
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  fill(0);

  // Stock price label
  text('Stock Price: $' + stockPrice.toFixed(2),
       margin, drawHeight + 25);

  // EPS label
  text('Earnings/Share: $' + earningsPerShare.toFixed(2),
       margin, drawHeight + 60);

  // Industry P/E label
  text('Industry Avg P/E: ' + industryAvgPE.toFixed(1),
       margin, drawHeight + 95);
}

function calculatePE() {
  stockPrice = priceSlider.value();
  earningsPerShare = epsSlider.value();
  industryAvgPE = industryPESlider.value();

  if (earningsPerShare > 0) {
    peRatio = stockPrice / earningsPerShare;
  } else {
    peRatio = 0; // Not meaningful for negative or zero earnings
  }
}

function getPEColor() {
  if (earningsPerShare <= 0) return color(150);

  let difference = peRatio - industryAvgPE;
  let percentDiff = Math.abs((difference / industryAvgPE) * 100);

  if (percentDiff < 10) {
    return color(100, 150, 100); // Green - fairly valued
  } else if (difference > 0) {
    return color(200, 100, 50); // Orange - overvalued
  } else {
    return color(50, 100, 200); // Blue - undervalued
  }
}

function loadCompany(type) {
  let company = sampleCompanies[type];

  priceSlider.value(company.price);
  epsSlider.value(company.eps);
  industryPESlider.value(company.industryPE);

  calculatePE();
}

function styleButton(button) {
  button.style('padding', '8px 12px');
  button.style('font-size', '14px');
  button.style('background-color', '#4CAF50');
  button.style('color', 'white');
  button.style('border', 'none');
  button.style('border-radius', '4px');
  button.style('cursor', 'pointer');
}

function windowResized() {
  updateCanvasSize();
  resizeCanvas(canvasWidth, canvasHeight);

  // Resize sliders
  if (priceSlider) {
    priceSlider.size(canvasWidth - sliderLeftMargin - margin);
  }
  if (epsSlider) {
    epsSlider.size(canvasWidth - sliderLeftMargin - margin);
  }
  if (industryPESlider) {
    industryPESlider.size(canvasWidth - sliderLeftMargin - margin);
  }
}

function updateCanvasSize() {
  const container = document.querySelector('main');
  if (container) {
    canvasWidth = container.offsetWidth;
  }
}
