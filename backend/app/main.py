import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, text
from app.database import engine, async_session, Base
from app.models import Section
from app.routers import sections, compartments, alarms, interlock_logs, inspections, thresholds, inspectors, websocket


async def _init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        result = await db.execute(select(Section).limit(1))
        if result.scalars().first() is None:
            init_sql_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "init.sql")
            if os.path.exists(init_sql_path):
                with open(init_sql_path, "r", encoding="utf-8") as f:
                    sql_content = f.read()
                statements = []
                current = []
                for line in sql_content.split("\n"):
                    stripped = line.strip()
                    if stripped.startswith("--"):
                        continue
                    if not stripped:
                        continue
                    current.append(line)
                    if ";" in line:
                        stmt = "\n".join(current).strip()
                        if stmt and stmt != ";":
                            statements.append(stmt)
                        current = []
                for stmt in statements:
                    try:
                        async with async_session() as sdb:
                            await sdb.execute(text(stmt))
                            await sdb.commit()
                    except Exception as e:
                        print(f"初始化SQL执行错误: {e}")
                        print(f"语句: {stmt[:100]}...")
                print("数据库种子数据初始化完成")
            else:
                print("未找到init.sql文件，跳过种子数据初始化")
        else:
            print("数据库已有数据，跳过初始化")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await _init_db()
    yield


app = FastAPI(
    title="城市地下综合管廊运维控制台",
    description="综合管廊监控、告警、联动、巡检管理后端API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sections.router, prefix="/api/sections", tags=["标段管理"])
app.include_router(compartments.router, prefix="/api/compartments", tags=["舱室管理"])
app.include_router(alarms.router, prefix="/api/alarms", tags=["告警管理"])
app.include_router(interlock_logs.router, prefix="/api/interlock-logs", tags=["联动日志"])
app.include_router(inspections.router, prefix="/api/inspections", tags=["巡检管理"])
app.include_router(thresholds.router, prefix="/api/thresholds", tags=["阈值配置"])
app.include_router(inspectors.router, prefix="/api/inspectors", tags=["巡检人员"])
app.include_router(websocket.router, prefix="/ws", tags=["WebSocket"])


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "综合管廊运维控制台"}
