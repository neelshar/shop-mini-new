import React from 'react'

interface SimpleKeyboardViewerProps {
  layout?: 'tkl' | '60' | '65' | 'full' | 'ansi' | 'iso'
  caseColor?: string
  keycapColor?: string
  switchColor?: string
  className?: string
}

export function SimpleKeyboardViewer({ 
  layout = 'tkl',
  caseColor = '#6b7280',
  keycapColor = '#9ca3af', 
  switchColor = '#ffa726',
  className = ''
}: SimpleKeyboardViewerProps) {
  
  // Layout configurations
  const layouts = {
    '60': { rows: 5, cols: 14, name: '60%' },
    '65': { rows: 5, cols: 16, name: '65%' },
    'tkl': { rows: 6, cols: 17, name: 'TKL' },
    'full': { rows: 6, cols: 21, name: 'Full' },
    'ansi': { rows: 6, cols: 17, name: 'ANSI' },
    'iso': { rows: 6, cols: 17, name: 'ISO' }
  }
  
  const currentLayout = layouts[layout]
  
  // Generate key positions
  const keys = []
  for (let row = 0; row < currentLayout.rows; row++) {
    for (let col = 0; col < currentLayout.cols; col++) {
      // Skip some keys for realistic layout
      if (layout === '60' && row === 0 && col > 12) continue
      if (layout === '60' && row === 5) continue
      
      keys.push({
        id: `key-${row}-${col}`,
        x: col * 32 + 10,
        y: row * 32 + 10,
        width: 30,
        height: 30
      })
    }
  }
  
  const totalWidth = currentLayout.cols * 32 + 20
  const totalHeight = currentLayout.rows * 32 + 20
  
  return (
    <div className={`w-full h-full flex items-center justify-center ${className}`}>
      <div 
        className="relative transform-gpu transition-all duration-300 hover:scale-105"
        style={{
          filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))',
          transform: 'perspective(800px) rotateX(25deg) rotateY(-5deg)'
        }}
      >
        {/* Keyboard Case */}
        <div
          className="relative rounded-2xl border-2 shadow-2xl"
          style={{
            width: totalWidth + 40,
            height: totalHeight + 40,
            backgroundColor: caseColor,
            borderColor: caseColor,
            background: `linear-gradient(145deg, ${caseColor}, ${caseColor}dd)`
          }}
        >
          {/* Case top highlight */}
          <div 
            className="absolute inset-2 rounded-xl opacity-20"
            style={{
              background: 'linear-gradient(145deg, white, transparent)'
            }}
          />
          
          {/* Key plate */}
          <div
            className="absolute inset-4 rounded-lg"
            style={{
              backgroundColor: `${caseColor}88`,
              background: `linear-gradient(145deg, ${caseColor}dd, ${caseColor}88)`
            }}
          >
            {/* Keys */}
            <svg 
              width={totalWidth} 
              height={totalHeight}
              className="absolute inset-0"
              viewBox={`0 0 ${totalWidth} ${totalHeight}`}
            >
              {keys.map((key, index) => (
                <g key={key.id}>
                  {/* Key shadow */}
                  <rect
                    x={key.x + 1}
                    y={key.y + 1}
                    width={key.width}
                    height={key.height}
                    rx="4"
                    fill="rgba(0,0,0,0.3)"
                  />
                  {/* Switch housing */}
                  <rect
                    x={key.x}
                    y={key.y + 2}
                    width={key.width}
                    height={key.height - 2}
                    rx="3"
                    fill={switchColor}
                    opacity="0.8"
                  />
                  {/* Keycap */}
                  <rect
                    x={key.x}
                    y={key.y}
                    width={key.width}
                    height={key.height}
                    rx="4"
                    fill={keycapColor}
                    stroke={`${keycapColor}dd`}
                    strokeWidth="1"
                  />
                  {/* Keycap highlight */}
                  <rect
                    x={key.x + 2}
                    y={key.y + 2}
                    width={key.width - 4}
                    height={8}
                    rx="2"
                    fill="rgba(255,255,255,0.2)"
                  />
                  {/* Legend placeholder */}
                  <circle
                    cx={key.x + key.width/2}
                    cy={key.y + key.height/2}
                    r="2"
                    fill="rgba(0,0,0,0.4)"
                  />
                </g>
              ))}
            </svg>
          </div>
          
          {/* Branding */}
          <div className="absolute bottom-2 right-4 text-xs opacity-50 text-white font-medium">
            {currentLayout.name}
          </div>
        </div>
        
        {/* Reflection */}
        <div 
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.1), transparent 50%)',
            transform: 'translateZ(1px)'
          }}
        />
      </div>
    </div>
  )
}
