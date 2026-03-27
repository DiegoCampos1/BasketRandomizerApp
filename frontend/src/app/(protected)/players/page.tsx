"use client";

import { useState } from "react";
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
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { usePlayers } from "@/hooks/players/usePlayers";
import { usePlayerMutations } from "@/hooks/players/usePlayerMutations";
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
  const { data: players = [] } = usePlayers();
  const { createPlayer, updatePlayer, deletePlayer } = usePlayerMutations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showTips, setShowTips] = useState(true);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [form, setForm] = useState({
    name: "",
    height_cm: "",
    position: "guard" as Position,
    quality: 3,
  });

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
      await updatePlayer.mutateAsync({ id: editingPlayer.id, data });
    } else {
      await createPlayer.mutateAsync(data);
    }

    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este jogador?")) return;
    await deletePlayer.mutateAsync(id);
  };

  return (
    <Box>
      <Box className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Box className="flex items-center justify-between sm:justify-start gap-3">
          <Typography variant="h4" className="font-bold">Jogadores</Typography>
          {players.length > 0 && (
            <Chip
              label={`${players.length} cadastrados`}
              size="small"
              color="secondary"
              variant="outlined"
            />
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          className="w-full sm:w-auto"
        >
          Adicionar Jogador
        </Button>
      </Box>

      {showTips && (
        <Alert
          severity="info"
          onClose={() => setShowTips(false)}
          className="mb-4"
        >
          <AlertTitle className="font-bold">Dicas para um bom cadastro</AlertTitle>
          <ul className="m-0 flex flex-col gap-1 pl-4">
            <li>
              <strong>Qualidade:</strong> avalie em relação aos jogadores da sua organização, não
              a profissionais. O melhor jogador de cada posição deve receber 5 estrelas e os demais
              devem ser avaliados em comparação a ele.
            </li>
            <li>
              <strong>Altura:</strong> preencha com precisão — o algoritmo usa esse dado para
              balancear os times.
            </li>
            <li>
              <strong>Posição:</strong> cadastre a posição principal do jogador para uma melhor
              distribuição entre os times.
            </li>
          </ul>
        </Alert>
      )}

      {players.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Typography variant="h6" color="text.secondary">
              Nenhum jogador cadastrado
            </Typography>
            <Typography variant="body2" color="text.secondary">
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
            <Card
              key={player.id}
              sx={{
                cursor: "pointer",
                transition: "box-shadow 0.2s ease, transform 0.2s ease",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                  transform: "translateY(-1px)",
                },
              }}
              onClick={() => openEdit(player)}
            >
              <CardContent className="p-5">
                <Box className="mb-3 flex items-start justify-between">
                  <Typography variant="subtitle1" className="font-bold leading-tight">
                    {player.name}
                  </Typography>
                  <Box className="ml-2 flex shrink-0">
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); openEdit(player); }}
                      sx={{ color: "text.secondary" }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); handleDelete(player.id); }}
                      sx={{ color: "text.secondary" }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                <Box className="mb-3 flex flex-wrap gap-1.5">
                  <Chip
                    label={POSITION_LABELS[player.position]}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 500 }}
                  />
                  <Chip
                    label={HEIGHT_CATEGORY_LABELS[player.height_category]}
                    size="small"
                    color={HEIGHT_COLORS[player.height_category]}
                    sx={{ fontWeight: 500 }}
                  />
                  <Chip
                    label={`${player.height_cm} cm`}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 500 }}
                  />
                </Box>

                <Rating
                  value={player.quality}
                  readOnly
                  size="small"
                  max={5}
                />
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
        <DialogTitle className="font-bold">
          {editingPlayer ? "Editar Jogador" : "Novo Jogador"}
        </DialogTitle>
        <Divider />
        <DialogContent className="flex flex-col gap-4" sx={{ pt: 3 }}>
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
        <Divider />
        <DialogActions className="px-6 py-4">
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSave} size="large">
            {editingPlayer ? "Salvar" : "Criar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
