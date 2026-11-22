import "reflect-metadata";
import {
  ArgumentsHost,
  Catch,
  Controller,
  ExceptionFilter,
  Get,
  HttpException,
  Module,
} from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { Response } from "express";

@Controller()
class HealthController {
  @Get("health")
  health() {
    return { status: "ok" };
  }
}

@Catch()
class HttpErrorFilter implements ExceptionFilter {
  catch(cause: unknown, host: ArgumentsHost) {
    const status = cause instanceof HttpException ? cause.getStatus() : 500;
    const known: Record<number, [string, string]> = {
      400: ["INVALID_QUERY", "Parámetros inválidos"],
      404: ["NOT_FOUND", "Recurso no disponible"],
      500: ["SERVER_ERROR", "Error interno"],
    };
    const [code, message] = known[status] ?? [
      "HTTP_ERROR",
      "Solicitud rechazada",
    ];
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(status)
      .json({ error: { code, message } });
  }
}

@Module({ controllers: [HealthController] })
class AppModule {}

export async function createApp() {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.useGlobalFilters(new HttpErrorFilter());
  app.enableShutdownHooks();
  return app;
}
