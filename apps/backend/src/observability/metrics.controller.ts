import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';

@Controller('metrics')
export class MetricsController {
  @Get()
  async getMetrics(@Res() res: Response) {
    // Add custom metrics
    const customMetrics = await this.getCustomMetrics();
    
    // Get basic metrics (simplified version)
    const basicMetrics = await this.getBasicMetrics();
    
    // Combine metrics
    const allMetrics = basicMetrics + customMetrics;
    
    res.set('Content-Type', 'text/plain');
    res.send(allMetrics);
  }

  private async getBasicMetrics(): Promise<string> {
    const timestamp = Date.now();
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    return `# HELP process_uptime_seconds Total number of seconds the process has been running
# TYPE process_uptime_seconds gauge
process_uptime_seconds ${uptime} ${timestamp}

# HELP process_memory_rss_bytes Resident memory size in bytes
# TYPE process_memory_rss_bytes gauge
process_memory_rss_bytes ${memoryUsage.rss} ${timestamp}

# HELP process_memory_heap_used_bytes Process heap size from node.js in bytes
# TYPE process_memory_heap_used_bytes gauge
process_memory_heap_used_bytes ${memoryUsage.heapUsed} ${timestamp}

# HELP process_memory_heap_total_bytes Process heap size from node.js in bytes
# TYPE process_memory_heap_total_bytes gauge
process_memory_heap_total_bytes ${memoryUsage.heapTotal} ${timestamp}

`;
  }

  private async getCustomMetrics(): Promise<string> {
    const timestamp = Date.now();
    return `# HELP aiquaa_app_info Application information
# TYPE aiquaa_app_info gauge
aiquaa_app_info{version="1.0.0",environment="${process.env.NODE_ENV || 'development'}"} 1 ${timestamp}
`;
  }
}
