// Sentiment Scoring Engine MicroSim
// This simulation demonstrates how sentiment analysis works on financial text
// using a simplified lexicon-based approach inspired by Loughran-McDonald dictionary

// Canvas dimensions - REQUIRED structure
let canvasWidth = 800;
let drawHeight = 500;
let controlHeight = 180;
let canvasHeight = drawHeight + controlHeight;
let margin = 25;
let sliderLeftMargin = 105;
let defaultTextSize = 16;

// Sentiment lexicons (simplified financial dictionaries)
const positiveWords = [
  'growth', 'profit', 'strong', 'excellent', 'success', 'positive',
  'gains', 'improved', 'breakthrough', 'innovation', 'outperform',
  'revenue', 'earnings', 'dividend', 'expansion', 'opportunities',
  'strategic', 'momentum', 'optimistic', 'confidence', 'leadership'
];

const negativeWords = [
  'loss', 'decline', 'weak', 'poor', 'failure', 'negative',
  'concerns', 'risks', 'challenges', 'uncertainty', 'underperform',
  'deficit', 'volatility', 'litigation', 'restructuring', 'layoffs',
  'downturn', 'headwinds', 'disappointed', 'warning', 'crisis'
];

// Text input and analysis
let inputText = 'Enter your financial text here...';
let sentimentScore = 0;
let positiveCount = 0;
let negativeCount = 0;
let totalWords = 0;

// Sample texts for demonstration
const sampleTexts = {
  positive: "We delivered strong revenue growth and excellent earnings this quarter, with strategic expansion driving optimistic momentum across all business segments.",
  negative: "The company faces significant challenges with declining profits, ongoing restructuring concerns, and persistent uncertainty in key markets causing investor worries.",
  neutral: "The company held its quarterly earnings call on Tuesday. Management discussed operations and answered questions from analysts.",
  mixed: "Despite strong revenue growth and innovation leadership, the company faces headwinds from market volatility and increased competition in certain segments."
};

// UI Elements
let textArea;
let sampleButtons = {};

function setup() {
  const canvas = createCanvas(canvasWidth, canvasHeight);
  // Find the main element or create a container
  let container = document.querySelector('main');
  if (container) {
    canvas.parent(container);
  }

  // Create text input area
  textArea = createElement('textarea', inputText);
  textArea.position(20, drawHeight + 10);
  textArea.size(canvasWidth - 40, 80);
  textArea.style('font-size', '14px');
  textArea.style('font-family', 'Arial');
  textArea.input(analyzeText);

  // Create sample text buttons
  let buttonY = drawHeight + 100;
  sampleButtons.positive = createButton('Positive Example');
  sampleButtons.positive.position(20, buttonY);
  sampleButtons.positive.mousePressed(() => loadSampleText('positive'));

  sampleButtons.negative = createButton('Negative Example');
  sampleButtons.negative.position(160, buttonY);
  sampleButtons.negative.mousePressed(() => loadSampleText('negative'));

  sampleButtons.neutral = createButton('Neutral Example');
  sampleButtons.neutral.position(310, buttonY);
  sampleButtons.neutral.mousePressed(() => loadSampleText('neutral'));

  sampleButtons.mixed = createButton('Mixed Example');
  sampleButtons.mixed.position(445, buttonY);
  sampleButtons.mixed.mousePressed(() => loadSampleText('mixed'));

  let clearButton = createButton('Clear Text');
  clearButton.position(570, buttonY);
  clearButton.mousePressed(clearText);

  // Style all buttons
  styleButton(sampleButtons.positive);
  styleButton(sampleButtons.negative);
  styleButton(sampleButtons.neutral);
  styleButton(sampleButtons.mixed);
  styleButton(clearButton);

  // Initial analysis
  analyzeText();

  describe('Interactive sentiment scoring engine that analyzes financial text and displays sentiment on a visual gauge', LABEL);
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
  text('Sentiment Scoring Engine', canvasWidth / 2, 15);

  // Draw sentiment gauge
  drawSentimentGauge();

  // Display metrics
  displayMetrics();

  // Instructions
  textSize(14);
  textAlign(LEFT, TOP);
  fill(80);
  text('Enter financial text or click a sample button to analyze sentiment:', 20, drawHeight + 140);

  // Reset text defaults
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  stroke(0);
}

function drawSentimentGauge() {
  let gaugeX = canvasWidth / 2;
  let gaugeY = 180;
  let gaugeWidth = 500;
  let gaugeHeight = 60;

  // Draw gauge background
  noStroke();

  // Negative section (red)
  fill(255, 100, 100);
  rect(gaugeX - gaugeWidth/2, gaugeY, gaugeWidth/2, gaugeHeight, 10, 0, 0, 10);

  // Positive section (green)
  fill(100, 255, 100);
  rect(gaugeX, gaugeY, gaugeWidth/2, gaugeHeight, 0, 10, 10, 0);

  // Center line
  stroke(100);
  strokeWeight(2);
  line(gaugeX, gaugeY, gaugeX, gaugeY + gaugeHeight);

  // Score labels
  noStroke();
  fill(0);
  textSize(14);
  textAlign(LEFT, CENTER);
  text('-1.0', gaugeX - gaugeWidth/2 - 35, gaugeY + gaugeHeight/2);
  textAlign(CENTER, CENTER);
  text('0', gaugeX, gaugeY + gaugeHeight/2);
  textAlign(RIGHT, CENTER);
  text('+1.0', gaugeX + gaugeWidth/2 + 35, gaugeY + gaugeHeight/2);

  // Draw needle/indicator
  let needleX = map(sentimentScore, -1, 1, gaugeX - gaugeWidth/2, gaugeX + gaugeWidth/2);
  needleX = constrain(needleX, gaugeX - gaugeWidth/2, gaugeX + gaugeWidth/2);

  // Needle line
  stroke(50);
  strokeWeight(4);
  line(needleX, gaugeY - 10, needleX, gaugeY + gaugeHeight + 10);

  // Needle circle
  fill(50);
  noStroke();
  circle(needleX, gaugeY + gaugeHeight/2, 20);

  // Score display above gauge
  fill(0);
  textSize(24);
  textAlign(CENTER, BOTTOM);
  text(`Score: ${sentimentScore.toFixed(3)}`, gaugeX, gaugeY - 25);

  // Sentiment label
  let sentimentLabel = getSentimentLabel(sentimentScore);
  textSize(20);
  fill(getSentimentColor(sentimentScore));
  text(sentimentLabel, gaugeX, gaugeY - 50);

  // Reset defaults
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  stroke(0);
  strokeWeight(1);
}

function displayMetrics() {
  let metricsX = 30;
  let metricsY = 300;
  let lineHeight = 30;

  textAlign(LEFT, CENTER);
  textSize(16);
  fill(0);

  text(`Total Words: ${totalWords}`, metricsX, metricsY);

  fill(100, 200, 100);
  text(`Positive Words: ${positiveCount}`, metricsX, metricsY + lineHeight);

  fill(200, 100, 100);
  text(`Negative Words: ${negativeCount}`, metricsX, metricsY + lineHeight * 2);

  fill(0);
  text(`Net Sentiment: ${positiveCount - negativeCount}`, metricsX, metricsY + lineHeight * 3);

  // Show sample words found
  if (positiveCount > 0 || negativeCount > 0) {
    textSize(14);
    fill(80);
    let foundWords = getFoundWords();
    if (foundWords.positive.length > 0) {
      fill(100, 150, 100);
      text(`Positive: ${foundWords.positive.slice(0, 8).join(', ')}${foundWords.positive.length > 8 ? '...' : ''}`,
           metricsX + 250, metricsY + lineHeight);
    }
    if (foundWords.negative.length > 0) {
      fill(150, 100, 100);
      text(`Negative: ${foundWords.negative.slice(0, 8).join(', ')}${foundWords.negative.length > 8 ? '...' : ''}`,
           metricsX + 250, metricsY + lineHeight * 2);
    }
  }
}

function analyzeText() {
  // Get text from textarea
  inputText = textArea.value();

  // Convert to lowercase and split into words
  let words = inputText.toLowerCase().match(/\b\w+\b/g) || [];
  totalWords = words.length;

  // Count positive and negative words
  positiveCount = 0;
  negativeCount = 0;

  words.forEach(word => {
    if (positiveWords.includes(word)) {
      positiveCount++;
    }
    if (negativeWords.includes(word)) {
      negativeCount++;
    }
  });

  // Calculate sentiment score
  // Score ranges from -1 (very negative) to +1 (very positive)
  if (totalWords === 0) {
    sentimentScore = 0;
  } else {
    let netSentiment = positiveCount - negativeCount;
    // Normalize by total words to get a score between -1 and 1
    sentimentScore = netSentiment / Math.max(totalWords * 0.3, 1);
    sentimentScore = constrain(sentimentScore, -1, 1);
  }
}

function getFoundWords() {
  let words = inputText.toLowerCase().match(/\b\w+\b/g) || [];
  let found = {
    positive: [],
    negative: []
  };

  words.forEach(word => {
    if (positiveWords.includes(word) && !found.positive.includes(word)) {
      found.positive.push(word);
    }
    if (negativeWords.includes(word) && !found.negative.includes(word)) {
      found.negative.push(word);
    }
  });

  return found;
}

function getSentimentLabel(score) {
  if (score > 0.3) return 'Very Positive';
  if (score > 0.1) return 'Positive';
  if (score > -0.1) return 'Neutral';
  if (score > -0.3) return 'Negative';
  return 'Very Negative';
}

function getSentimentColor(score) {
  if (score > 0.3) return color(0, 150, 0);
  if (score > 0.1) return color(100, 180, 100);
  if (score > -0.1) return color(100, 100, 100);
  if (score > -0.3) return color(180, 100, 100);
  return color(150, 0, 0);
}

function loadSampleText(type) {
  textArea.value(sampleTexts[type]);
  analyzeText();
}

function clearText() {
  textArea.value('');
  analyzeText();
}

function styleButton(button) {
  button.style('padding', '8px 15px');
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

  // Reposition textarea
  if (textArea) {
    textArea.size(canvasWidth - 40, 80);
  }
}

function updateCanvasSize() {
  const container = document.querySelector('main');
  if (container) {
    canvasWidth = container.offsetWidth;
  }
}
