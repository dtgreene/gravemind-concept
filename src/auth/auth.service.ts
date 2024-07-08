import { Injectable, Logger } from '@nestjs/common';
import { type Request } from 'express';

export interface IAuthContext {
  token?: string;
  jwt?: {};
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  /**
   * getAuthContext
   * @param req express.Request
   */
  public getAuthContext(req: Request): IAuthContext {
    try {
      const token = this.getTokenFromHeaders(req.headers);
      // const jwt = await this.getTokenPayload(token)
      return { token, jwt: {} };
    } catch (err) {
      this.logger.warn(`Invalid auth context: ${err.message}`);
      return {};
    }
  }

  /**
   * hasPermission - token format "object:action,action" or "object:*"
   * @param permissions string[]
   * @param action string
   * @param object string
   */
  public static hasPermission(
    permissions: string[],
    object: string,
    action: string
  ) {
    return permissions.some((perm) => {
      const tokens = perm.split(':');

      // validate object
      const obj = tokens[0];
      if (object.toLowerCase() !== obj.toLowerCase()) {
        return false;
      }

      // validate action
      return tokens[1].split(',').some((act: string) => {
        if (act === '*') return true;
        return action.toLowerCase() === act.toLowerCase();
      });
    });
  }

  private getTokenFromHeaders(headers: Request['headers']) {
    if (!headers.authorization) {
      throw new Error('Missing bearer token');
    }

    const split = headers.authorization.split(' ');
    if (split.length !== 2) {
      throw new Error('Invalid bearer token format');
    }
    return split[1];
  }
}
