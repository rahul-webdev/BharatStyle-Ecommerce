import { NextResponse } from 'next/server';
import { getProducts } from '@/controllers/product/productController';
import { getCategories } from '@/controllers/category/categoryController';
import { getSiteSettings, getGlobalReviews } from '@/controllers/admin/settingsController';
import { secureResponse } from '@/lib/apiResponse';

import { decrypt } from '@/lib/crypto';

export const POST = async (req: Request) => {
  try {
    const { requests } = await req.json();

    if (!Array.isArray(requests)) {
      return NextResponse.json({ error: 'Requests must be an array' }, { status: 400 });
    }

    const results = await Promise.all(
      requests.map(async (request: { endpoint: string; params?: Record<string, string> }) => {
        const { endpoint, params = {} } = request;
        
        const url = new URL(`http://localhost${endpoint}`);
        Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
        const mockReq = new Request(url.toString());

        try {
          let response;
          switch (endpoint) {
            case '/api/products':
              response = await getProducts(mockReq);
              break;
            case '/api/categories':
              response = await getCategories(mockReq);
              break;
            case '/api/settings':
              response = await getSiteSettings();
              break;
            case '/api/reviews/global':
              response = await getGlobalReviews();
              break;
            default:
              return { endpoint, error: 'Endpoint not found in batch' };
          }

          const json = await response.json();
          // Decrypt individual response data to avoid double encryption in the batch
          let finalData = json;
          if (json && typeof json.data === 'string') {
            try {
              const decrypted = decrypt(json.data);
              finalData = JSON.parse(decrypted);
            } catch (e) {
              finalData = decrypt(json.data);
            }
          }
          return { endpoint, data: finalData, params };
        } catch (error: any) {
          return { endpoint, error: error.message };
        }
      })
    );

    return secureResponse({ results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
