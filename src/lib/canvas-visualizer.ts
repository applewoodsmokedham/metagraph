import { createCanvas } from 'canvas';

/**
 * Class to visualize runestone data using Canvas
 */
export class RunestoneCanvasVisualizer {
  /**
   * Generate a visualization for a single runestone
   * @param runestoneData The decoded runestone data
   * @returns Buffer containing the PNG image
   */
  static visualizeSingle(runestoneData: any): Buffer {
    const width = 800;
    const height = 600;
    
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Fill the background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);
    
    // Add a title
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#e94560';
    ctx.fillText('Runestone Visualization', 20, 40);
    
    // Add metadata
    ctx.font = '16px Arial';
    ctx.fillStyle = '#16213e';
    ctx.fillRect(20, 60, width - 40, 80);
    ctx.fillStyle = '#ffffff';
    
    const txid = runestoneData.txid || 'Unknown';
    const blockHeight = runestoneData.blockHeight || 'Unknown';
    
    ctx.fillText(`TXID: ${txid.substring(0, 20)}...`, 30, 85);
    ctx.fillText(`Block: ${blockHeight}`, 30, 110);
    
    // Protocol field
    let yPos = 180;
    if (runestoneData.data && runestoneData.data.protocolField) {
      ctx.fillStyle = '#0f3460';
      ctx.fillRect(20, yPos - 30, width - 40, 60);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px Arial';
      ctx.fillText('Protocol Field (0x7fff)', 30, yPos - 5);
      
      ctx.font = '16px Arial';
      const protocolValues = runestoneData.data.protocolField.values || [];
      const protocolText = protocolValues.join(', ');
      ctx.fillText(`Values: ${protocolText}`, 30, yPos + 20);
      
      yPos += 80;
    }
    
    // Protostones
    if (runestoneData.data && runestoneData.data.protostones) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px Arial';
      ctx.fillText('Protostones', 30, yPos - 5);
      
      const protostones = runestoneData.data.protostones;
      for (let i = 0; i < protostones.length && i < 5; i++) {
        const protostone = protostones[i];
        
        ctx.fillStyle = '#0f3460';
        ctx.fillRect(20, yPos + (i * 60), width - 40, 50);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.fillText(`Tag: ${protostone.tag}`, 30, yPos + (i * 60) + 25);
        
        const values = protostone.values || [];
        const valueText = values.length > 0 
          ? values.join(', ') 
          : 'No values';
        ctx.fillText(`Values: ${valueText.substring(0, 50)}${valueText.length > 50 ? '...' : ''}`, 30, yPos + (i * 60) + 45);
      }
      
      if (protostones.length > 5) {
        yPos += 5 * 60 + 20;
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.fillText(`+${protostones.length - 5} more protostones...`, 30, yPos);
      }
    }
    
    // Return the canvas as a PNG buffer
    return canvas.toBuffer('image/png');
  }
  
  /**
   * Generate a summary visualization for multiple runestones
   * @param runestones Array of decoded runestone data
   * @returns Buffer containing the PNG image
   */
  static visualizeSummary(runestones: any[]): Buffer {
    const width = 800;
    const height = 600;
    
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Fill the background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);
    
    // Add a title
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#e94560';
    ctx.fillText('Runestone Summary', 20, 40);
    
    // Count by protocol
    const protocolCounts: Record<string, number> = {};
    for (const runestone of runestones) {
      const protocolName = runestone.data?.protocolName || 'Unknown';
      protocolCounts[protocolName] = (protocolCounts[protocolName] || 0) + 1;
    }
    
    // Draw protocol distribution
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Protocol Distribution', 30, 80);
    
    let yPos = 100;
    const protocols = Object.keys(protocolCounts);
    for (let i = 0; i < protocols.length; i++) {
      const protocol = protocols[i];
      const count = protocolCounts[protocol];
      const percentage = (count / runestones.length) * 100;
      
      // Bar background
      ctx.fillStyle = '#16213e';
      ctx.fillRect(30, yPos, width - 60, 30);
      
      // Bar fill
      ctx.fillStyle = '#e94560';
      ctx.fillRect(30, yPos, (width - 60) * (percentage / 100), 30);
      
      // Label
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px Arial';
      ctx.fillText(`${protocol}: ${count} (${percentage.toFixed(1)}%)`, 40, yPos + 20);
      
      yPos += 40;
    }
    
    // Block distribution
    yPos += 20;
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Recent Blocks with Runestones', 30, yPos);
    
    const blockHeights = new Set<number>();
    for (const runestone of runestones) {
      if (runestone.blockHeight) {
        blockHeights.add(runestone.blockHeight);
      }
    }
    
    // Sort block heights in descending order
    const sortedHeights = Array.from(blockHeights).sort((a, b) => b - a);
    
    yPos += 30;
    ctx.font = '14px Arial';
    ctx.fillStyle = '#ffffff';
    
    const heightsPerRow = 5;
    for (let i = 0; i < Math.min(sortedHeights.length, 20); i++) {
      const row = Math.floor(i / heightsPerRow);
      const col = i % heightsPerRow;
      
      ctx.fillText(sortedHeights[i].toString(), 30 + (col * 150), yPos + (row * 30));
    }
    
    if (sortedHeights.length > 20) {
      yPos += Math.floor(20 / heightsPerRow) * 30 + 30;
      ctx.fillText(`+${sortedHeights.length - 20} more blocks...`, 30, yPos);
    }
    
    // Return the canvas as a PNG buffer
    return canvas.toBuffer('image/png');
  }
}
