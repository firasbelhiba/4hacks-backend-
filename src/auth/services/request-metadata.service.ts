import { Injectable } from '@nestjs/common';
import { Request } from 'express';

export interface SessionMetadata {
  ipAddress: string | null;
  userAgent: string | null;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  browser: string | null;
  os: string | null;
}

@Injectable()
export class RequestMetadataService {
  /**
   * Extracts session metadata from the HTTP request
   * Handles proxy scenarios using X-Forwarded-For header
   */
  extractMetadata(req: Request): SessionMetadata {
    const ipAddress = this.extractIpAddress(req);
    const userAgent = (req.headers['user-agent'] as string) || null;
    const parsedUA = this.parseUserAgent(userAgent);

    return {
      ipAddress,
      userAgent,
      deviceType: parsedUA.deviceType,
      browser: parsedUA.browser,
      os: parsedUA.os,
    };
  }

  /**
   * Extracts client IP address, handling reverse proxy scenarios
   * Priority: X-Forwarded-For > X-Real-IP > req.ip > socket.remoteAddress
   */
  private extractIpAddress(req: Request): string | null {
    // X-Forwarded-For can contain multiple IPs: client, proxy1, proxy2
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
      const ips = Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : forwardedFor.split(',')[0];
      return ips?.trim() || null;
    }

    // X-Real-IP is set by some proxies (nginx)
    const realIp = req.headers['x-real-ip'];
    if (realIp) {
      return Array.isArray(realIp) ? realIp[0] : realIp;
    }

    // Fallback to Express req.ip (works if trust proxy is configured)
    if (req.ip) {
      return req.ip;
    }

    // Last resort: socket remote address
    return req.socket?.remoteAddress || null;
  }

  /**
   * Parses User-Agent string to extract device, browser, and OS info
   */
  private parseUserAgent(userAgent: string | null): {
    deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
    browser: string | null;
    os: string | null;
  } {
    if (!userAgent) {
      return { deviceType: 'unknown', browser: null, os: null };
    }

    const deviceType = this.detectDeviceType(userAgent);
    const browser = this.detectBrowser(userAgent);
    const os = this.detectOS(userAgent);

    return { deviceType, browser, os };
  }

  private detectDeviceType(
    userAgent: string,
  ): 'desktop' | 'mobile' | 'tablet' | 'unknown' {
    const ua = userAgent.toLowerCase();

    if (/tablet|ipad|playbook|silk/i.test(ua)) {
      return 'tablet';
    }

    if (
      /mobile|iphone|ipod|android.*mobile|windows phone|blackberry/i.test(ua)
    ) {
      return 'mobile';
    }

    if (/windows|macintosh|linux|cros/i.test(ua)) {
      return 'desktop';
    }

    return 'unknown';
  }

  private detectBrowser(userAgent: string): string | null {
    if (/edg\//i.test(userAgent)) return 'Edge';
    if (/chrome/i.test(userAgent) && !/edg/i.test(userAgent)) return 'Chrome';
    if (/firefox/i.test(userAgent)) return 'Firefox';
    if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent))
      return 'Safari';
    if (/msie|trident/i.test(userAgent)) return 'Internet Explorer';
    if (/opera|opr/i.test(userAgent)) return 'Opera';
    return null;
  }

  private detectOS(userAgent: string): string | null {
    if (/windows nt/i.test(userAgent)) return 'Windows';
    if (/macintosh|mac os x/i.test(userAgent)) return 'macOS';
    if (/linux/i.test(userAgent) && !/android/i.test(userAgent)) return 'Linux';
    if (/android/i.test(userAgent)) return 'Android';
    if (/iphone|ipad|ipod/i.test(userAgent)) return 'iOS';
    if (/cros/i.test(userAgent)) return 'Chrome OS';
    return null;
  }
}