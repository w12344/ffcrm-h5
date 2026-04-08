/**
 * RSA 加密工具
 * 优先使用 Web Crypto API；Safari/WebKit 已移除 RSAES-PKCS1-v1_5 支持，自动降级为 node-forge
 */

import forge from 'node-forge';

const RSA_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCIccmdI4XFJ+EAMdz+FkUGles+
j1Ax+PeN1f8If4JBWmQ/KTFzDQrnuZNLq5xCILITXxn9V4H/fTZSwittMWDxbLuS
7z9JUGlMYGCcdKujXjov0aoWCGG95LA2nSecpukjP1zU/bqSsdTHJkbLRHi8H4/W
06u02TmQypUPioM7iwIDAQAB
-----END PUBLIC KEY-----`;

/**
 * 使用 Web Crypto API 加密（Chrome/Firefox 等支持 RSAES-PKCS1-v1_5 的浏览器）
 */
async function encryptWithWebCrypto(plainText: string): Promise<string> {
  const pemToBinary = (pem: string): ArrayBuffer => {
    const base64 = pem
      .replace(/-----BEGIN PUBLIC KEY-----/g, '')
      .replace(/-----END PUBLIC KEY-----/g, '')
      .replace(/\s/g, '');
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  };

  const keyBuffer = pemToBinary(RSA_PUBLIC_KEY);
  const publicKey = await crypto.subtle.importKey(
    'spki',
    keyBuffer,
    { name: 'RSAES-PKCS1-v1_5' },
    false,
    ['encrypt']
  );

  const encoder = new TextEncoder();
  const data = encoder.encode(plainText);
  const encrypted = await crypto.subtle.encrypt(
    { name: 'RSAES-PKCS1-v1_5' },
    publicKey,
    data
  );

  const bytes = new Uint8Array(encrypted);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * 使用 node-forge 加密（Safari/WebKit 等不支持 RSAES-PKCS1-v1_5 时的降级方案）
 */
function encryptWithForge(plainText: string): string {
  const publicKey = forge.pki.publicKeyFromPem(RSA_PUBLIC_KEY);
  const encrypted = publicKey.encrypt(plainText, 'RSAES-PKCS1-V1_5');
  return forge.util.encode64(encrypted);
}

/**
 * 使用 RSA 公钥加密（PKCS1-v1_5，与 Java 端 RSA/ECB/PKCS1Padding 兼容）
 */
export async function rsaEncrypt(plainText: string): Promise<string> {
  try {
    return await encryptWithWebCrypto(plainText);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (
      msg.includes('Unrecognized name') ||
      msg.includes('Algorithm') ||
      msg.includes('RSAES-PKCS1')
    ) {
      return encryptWithForge(plainText);
    }
    console.error('[RSA] 加密失败:', err);
    throw new Error('密码加密失败');
  }
}
