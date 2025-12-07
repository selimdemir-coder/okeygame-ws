import { WebSocketServer } from "ws";

const PORT = process.env.PORT || 10000;

const wss = new WebSocketServer({ port: PORT });

let tables = {};

function broadcast(tableId, msg) {
  if (!tables[tableId]) return;
  tables[tableId].players.forEach(ws => {
    try { ws.send(JSON.stringify(msg)); } catch {}
  });
}

wss.on("connection", ws => {
  
  ws.send(JSON.stringify({ type: "connected" }));

  ws.on("message", raw => {
    let data = {};
    try { data = JSON.parse(raw); } catch {}

    if (data.type === "join_table") {
      if (!tables[data.table_id]) {
        tables[data.table_id] = { players: [] };
      }

      tables[data.table_id].players.push(ws);

      broadcast(data.table_id, {
        type: "player_join",
        user_id: data.user_id
      });
    }

    if (data.type === "draw_request") {
      broadcast(data.table_id, {
        type: "draw",
        player_id: data.user_id,
        tile: {
          value: 10,
          color: "KIRMIZI",
          img: "https://dummyimage.com/60x85/00ff99/000.png&text=10"
        }
      });
    }

    if (data.type === "discard") {
      broadcast(data.table_id, {
        type: "discard",
        player_id: data.user_id,
        tile: data.tile
      });
    }
  });
});

console.log("WebSocket server aktif → PORT:", PORT);
