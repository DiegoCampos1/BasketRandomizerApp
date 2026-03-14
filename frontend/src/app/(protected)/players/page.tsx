"use client";

import { useEffect, useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Rating from "@mui/material/Rating";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  getPlayers,
  createPlayer,
  updatePlayer,
  deletePlayer,
} from "@/lib/api/players";
import {
  Player,
  Position,
  POSITION_LABELS,
  HEIGHT_CATEGORY_LABELS,
} from "@/types/player";

const POSITIONS: Position[] = ["guard", "forward", "center"];

const HEIGHT_COLORS: Record<string, "default" | "primary" | "secondary"> = {
  small: "default",
  medium: "primary",
  tall: "secondary",
};

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [form, setForm] = useState({
    name: "",
    height_cm: "",
    position: "guard" as Position,
    quality: 3,
  });

  const loadPlayers = useCallback(async () => {
    try {
      const data = await getPlayers();
      setPlayers(data);
    } catch {
      /* empty */
    }
  }, []);

  useEffect(() => {
    loadPlayers();
  }, [loadPlayers]);

  const openCreate = () => {
    setEditingPlayer(null);
    setForm({ name: "", height_cm: "", position: "guard", quality: 3 });
    setDialogOpen(true);
  };

  const openEdit = (player: Player) => {
    setEditingPlayer(player);
    setForm({
      name: player.name,
      height_cm: String(player.height_cm),
      position: player.position,
      quality: player.quality,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const data = {
      name: form.name,
      height_cm: parseFloat(form.height_cm),
      position: form.position,
      quality: form.quality,
    };

    if (editingPlayer) {
      await updatePlayer(editingPlayer.id, data);
    } else {
      await createPlayer(data);
    }

    setDialogOpen(false);
    loadPlayers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este jogador?")) return;
    await deletePlayer(id);
    loadPlayers();
  };

  return (
    <Box>
      <Box className="mb-6 flex items-center justify-between">
        <Typography variant="h4">Jogadores</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
        >
          Adicionar Jogador
        </Button>
      </Box>

      {players.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Typography variant="h6" color="text.secondary">
              Nenhum jogador cadastrado
            </Typography>
            <Typography variant="body2" color="text.secondary" className="mb-4">
              Adicione jogadores para começar a dividir os times
            </Typography>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={openCreate}>
              Adicionar Primeiro Jogador
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {players.map((player) => (
            <Card key={player.id}>
              <CardContent className="p-4">
                <Box className="mb-2 flex items-start justify-between">
                  <Typography variant="h6" className="font-semibold">
                    {player.name}
                  </Typography>
                  <Box>
                    <IconButton size="small" onClick={() => openEdit(player)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(player.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                <Box className="flex flex-wrap gap-2">
                  <Chip
                    label={POSITION_LABELS[player.position]}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={HEIGHT_CATEGORY_LABELS[player.height_category]}
                    size="small"
                    color={HEIGHT_COLORS[player.height_category]}
                  />
                  <Chip
                    label={`${player.height_cm} cm`}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                <Box className="mt-2">
                  <Rating
                    value={player.quality}
                    readOnly
                    size="small"
                    max={5}
                  />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Dialog de criação/edição */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingPlayer ? "Editar Jogador" : "Novo Jogador"}
        </DialogTitle>
        <DialogContent className="flex flex-col gap-4 pt-4">
          <TextField
            label="Nome"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            fullWidth
            autoFocus
          />
          <TextField
            label="Altura (cm)"
            type="number"
            value={form.height_cm}
            onChange={(e) =>
              setForm((f) => ({ ...f, height_cm: e.target.value }))
            }
            fullWidth
            helperText="Ex: 180"
          />
          <TextField
            label="Posição"
            select
            value={form.position}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                position: e.target.value as Position,
              }))
            }
            fullWidth
          >
            {POSITIONS.map((pos) => (
              <MenuItem key={pos} value={pos}>
                {POSITION_LABELS[pos]}
              </MenuItem>
            ))}
          </TextField>
          <Box>
            <Typography variant="body2" color="text.secondary" className="mb-1">
              Qualidade
            </Typography>
            <Rating
              value={form.quality}
              onChange={(_, value) =>
                setForm((f) => ({ ...f, quality: value || 1 }))
              }
              max={5}
              size="large"
            />
          </Box>
        </DialogContent>
        <DialogActions className="p-4">
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            {editingPlayer ? "Salvar" : "Criar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
