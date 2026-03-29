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
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SportsBasketballIcon from "@mui/icons-material/SportsBasketball";
import StraightenIcon from "@mui/icons-material/Straighten";
import { usePlayers } from "@/hooks/players/usePlayers";
import { usePlayerMutations } from "@/hooks/players/usePlayerMutations";
import { useAuthStore } from "@/stores/authStore";
import {
  Player,
  Position,
  POSITION_LABELS,
} from "@/types/player";

const POSITIONS: Position[] = ["guard", "forward", "center"];

export default function PlayersPage() {
  const { data: players = [] } = usePlayers();
  const { createPlayer, updatePlayer, deletePlayer, approvePlayer } =
    usePlayerMutations();
  const user = useAuthStore((s) => s.user);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showTips, setShowTips] = useState(true);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    name: "",
    height_cm: "",
    position: "guard" as Position,
    quality: 3,
  });

  const pendingPlayers = players.filter((p) => !p.is_approved);
  const approvedPlayers = players.filter((p) => p.is_approved);

  const orgSlug = user?.organization?.slug;
  const shareUrl =
    typeof window !== "undefined" && orgSlug
      ? `${window.location.origin}/${orgSlug}/addPlayer`
      : "";

  const copyShareUrl = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
      quality: player.quality || 3,
    });
    setDialogOpen(true);
  };

  const isEditing = !!editingPlayer;
  const isPendingApproval = isEditing && !editingPlayer?.is_approved;

  const isFormValid =
    form.name.trim() !== "" &&
    form.height_cm !== "" &&
    parseFloat(form.height_cm) >= 100 &&
    parseFloat(form.height_cm) <= 250 &&
    (isPendingApproval ? form.quality >= 1 : true);

  const hasChanges = isEditing
    ? form.name !== editingPlayer?.name ||
      form.height_cm !== String(editingPlayer?.height_cm) ||
      form.position !== editingPlayer?.position ||
      form.quality !== editingPlayer?.quality
    : true;

  const handleSave = async () => {
    const data = {
      name: form.name,
      height_cm: parseFloat(form.height_cm),
      position: form.position,
      quality: form.quality,
    };

    if (isPendingApproval && editingPlayer) {
      // First update player data, then approve
      await updatePlayer.mutateAsync({ id: editingPlayer.id, data });
      await approvePlayer.mutateAsync({
        id: editingPlayer.id,
        quality: form.quality,
      });
    } else if (editingPlayer) {
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
          <Typography variant="h4" className="font-bold">
            Jogadores
          </Typography>
          {players.length > 0 && (
            <Chip
              label={`${approvedPlayers.length} cadastrados`}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </Box>
        <Box className="flex gap-2">
          {shareUrl && (
            <Tooltip title={copied ? "Copiado!" : "Copiar link de cadastro"}>
              <Button
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                onClick={copyShareUrl}
                color={copied ? "success" : "primary"}
                className="w-full sm:w-auto"
              >
                {copied ? "Copiado!" : "Link de cadastro"}
              </Button>
            </Tooltip>
          )}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreate}
            className="w-full sm:w-auto"
          >
            Adicionar Jogador
          </Button>
        </Box>
      </Box>

      {showTips && (
        <Alert
          severity="info"
          onClose={() => setShowTips(false)}
          className="mb-4"
        >
          <AlertTitle className="font-bold">
            Dicas para um bom cadastro
          </AlertTitle>
          <ul className="m-0 flex flex-col gap-1 pl-4">
            <li>
              <strong>Qualidade:</strong> avalie em relação aos jogadores da sua
              organização, não a profissionais. O melhor jogador de cada posição
              deve receber 5 estrelas e os demais devem ser avaliados em
              comparação a ele.
            </li>
            <li>
              <strong>Altura:</strong> preencha com precisão — o algoritmo usa
              esse dado para balancear os times.
            </li>
            <li>
              <strong>Posição:</strong> cadastre a posição principal do jogador
              para uma melhor distribuição entre os times.
            </li>
            <li>
              <strong>Link de cadastro:</strong> compartilhe o link com seus
              jogadores para que eles se cadastrem sozinhos.
            </li>
          </ul>
        </Alert>
      )}

      {/* Pending approval section */}
      {pendingPlayers.length > 0 && (
        <Box className="mb-6">
          <Box className="mb-3 flex items-center gap-2">
            <Typography variant="h6" className="font-bold">
              Aguardando aprovação
            </Typography>
            <Chip
              label={pendingPlayers.length}
              size="small"
              color="warning"
            />
          </Box>
          <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pendingPlayers.map((player) => (
              <Card
                key={player.id}
                sx={{
                  cursor: "pointer",
                  transition: "box-shadow 0.2s ease, transform 0.2s ease",
                  backgroundColor: "rgba(245, 158, 11, 0.06)",
                  borderColor: "warning.main",
                  borderWidth: 1,
                  borderStyle: "solid",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(245, 158, 11, 0.2)",
                    transform: "translateY(-1px)",
                  },
                }}
                onClick={() => openEdit(player)}
              >
                <CardContent className="p-5">
                  <Box className="mb-3 flex items-start justify-between">
                    <Box className="flex items-center gap-2">
                      <Typography
                        variant="subtitle1"
                        className="font-bold leading-tight"
                      >
                        {player.name}
                      </Typography>
                      <Chip
                        label="Pendente"
                        size="small"
                        color="warning"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(player.id);
                      }}
                      sx={{ color: "text.secondary" }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Box className="flex flex-wrap gap-1.5">
                    <Chip
                      icon={<SportsBasketballIcon />}
                      label={POSITION_LABELS[player.position]}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />
                    <Chip
                      icon={<StraightenIcon />}
                      label={`${player.height_cm} cm`}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {/* Approved players */}
      {approvedPlayers.length === 0 && pendingPlayers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Typography variant="h6" color="text.secondary">
              Nenhum jogador cadastrado
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Adicione jogadores ou compartilhe o link de cadastro
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={openCreate}
            >
              Adicionar Primeiro Jogador
            </Button>
          </CardContent>
        </Card>
      ) : (
        approvedPlayers.length > 0 && (
          <Box>
            {pendingPlayers.length > 0 && (
              <Typography variant="h6" className="mb-3 font-bold">
                Jogadores aprovados
              </Typography>
            )}
            <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {approvedPlayers.map((player) => (
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
                      <Typography
                        variant="subtitle1"
                        className="font-bold leading-tight"
                      >
                        {player.name}
                      </Typography>
                      <Box className="ml-2 flex shrink-0">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(player);
                          }}
                          sx={{ color: "text.secondary" }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(player.id);
                          }}
                          sx={{ color: "text.secondary" }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    <Box className="mb-3 flex flex-wrap gap-1.5">
                      <Chip
                        icon={<SportsBasketballIcon />}
                        label={POSITION_LABELS[player.position]}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                      />
                      <Chip
                        icon={<StraightenIcon />}
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
          </Box>
        )
      )}

      {/* Dialog de criação/edição/aprovação */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="font-bold">
          {isPendingApproval
            ? "Aprovar Jogador"
            : editingPlayer
              ? "Editar Jogador"
              : "Novo Jogador"}
        </DialogTitle>
        <Divider />
        <DialogContent className="flex flex-col gap-4" sx={{ pt: 3 }}>
          {isPendingApproval && (
            <Alert severity="warning" className="mb-2">
              Este jogador se cadastrou pelo link público. Revise os dados e dê
              uma nota para aprová-lo.
            </Alert>
          )}
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
              Qualidade {isPendingApproval && <span>(obrigatório para aprovar)</span>}
            </Typography>
            <Rating
              value={form.quality}
              onChange={(_, value) =>
                setForm((f) => ({ ...f, quality: value || 0 }))
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
          <Button
            variant="contained"
            onClick={handleSave}
            size="large"
            disabled={!isFormValid || (!isPendingApproval && isEditing && !hasChanges)}
            color={isPendingApproval ? "warning" : "primary"}
          >
            {isPendingApproval ? "Aprovar" : editingPlayer ? "Salvar" : "Criar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
