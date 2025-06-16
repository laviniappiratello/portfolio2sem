// Versão otimizada e corrigida
const canvas = document.getElementById('glitchCanvas');
const ctx = canvas.getContext('2d');
const chars = "!#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_abcdefghijklmnopqrstuvwxyz{|}~";
const cols = 100;
const cellSize = 20;
let grid = []; // Movi a declaração para cá

function init() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  for(let i = 0; i < cols; i++) {
    grid[i] = {
      y: Math.random() * -canvas.height,
      speed: 1 + Math.random() * 5, //velocidade
      chars: new Array(Math.floor(canvas.height/cellSize)).fill(null).map(() => 
        chars[Math.floor(Math.random() * chars.length)])
    };
  }

  function animate() {
    ctx.fillStyle = 'rgba(0,0.01,0.1,0.1)'; // opacidade do glitch
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#0f0';
    ctx.font = '24px monospace';
    
    grid.forEach((col, x) => {
      col.y += col.speed *0.5;
      if(col.y > canvas.height) col.y = -cellSize;
      
      col.chars.forEach((char, y) => {
        if(Math.random() > 0.9) {
          char = chars[Math.floor(Math.random() * chars.length)];
        }
        ctx.fillText(char, x * cellSize, col.y + y * cellSize);
      });
    });
    
    requestAnimationFrame(animate);
  }
  
  animate();
}

// Eventos
window.addEventListener('load', init);
window.addEventListener('resize', init);