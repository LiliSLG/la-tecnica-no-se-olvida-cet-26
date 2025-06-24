// src/app/api/get-og-data/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { error: "URL parameter is required" },
        { status: 400 }
      );
    }

    // Validar que sea una URL válida
    let validUrl: URL;
    try {
      validUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    console.log("🔍 Fetching OG data for:", url);

    // Hacer request a la URL
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; OGBot/1.0; +http://www.example.com/bot)",
      },
      // Timeout de 10 segundos
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.status}` },
        { status: response.status }
      );
    }

    const html = await response.text();

    // Extraer meta tags Open Graph
    const extractMetaContent = (property: string): string | null => {
      const regexProperty = new RegExp(
        `<meta[^>]*property=["']og:${property}["'][^>]*content=["']([^"']*)["']`,
        "i"
      );
      const regexName = new RegExp(
        `<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']*)["']`,
        "i"
      );

      const matchProperty = html.match(regexProperty);
      const matchName = html.match(regexName);

      return matchProperty?.[1] || matchName?.[1] || null;
    };

    // Extraer datos
    const ogData = {
      title: extractMetaContent("title") || extractMetaContent("og:title"),
      description:
        extractMetaContent("description") ||
        extractMetaContent("og:description"),
      image: extractMetaContent("image") || extractMetaContent("og:image"),
      siteName:
        extractMetaContent("site_name") || extractMetaContent("og:site_name"),
      url: extractMetaContent("url") || extractMetaContent("og:url") || url,
    };

    // Para YouTube, mejorar la calidad de la imagen
    if (
      validUrl.hostname.includes("youtube.com") ||
      validUrl.hostname.includes("youtu.be")
    ) {
      if (ogData.image && ogData.image.includes("hqdefault")) {
        // Cambiar de hqdefault a maxresdefault para mejor calidad
        ogData.image = ogData.image.replace("hqdefault", "maxresdefault");
      }
    }

    console.log("✅ OG data extracted:", ogData);

    return NextResponse.json({
      success: true,
      data: ogData,
    });
  } catch (error) {
    console.error("❌ Error fetching OG data:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch Open Graph data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
