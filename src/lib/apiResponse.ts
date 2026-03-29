import { NextResponse } from 'next/server';
import { encrypt } from './crypto';

export const secureResponse = (data: any, status: number = 200) => {
  const jsonString = JSON.stringify(data);
  const encrypted = encrypt(jsonString);
  
  return NextResponse.json(
    { data: encrypted },
    { status }
  );
};

export const errorResponse = (message: string, status: number = 500) => {
  const data = { success: false, message };
  return secureResponse(data, status);
};
