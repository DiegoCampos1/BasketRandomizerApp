"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { Position, POSITION_LABELS } from "@/types/player";
import { publicCreatePlayer, getOrganizationInfo } from "@/lib/api/players";

const POSITIONS: Position[] = ["guard", "forward", "center"];

export default function PublicAddPlayerPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [orgName, setOrgName] = useState("");
  const [orgLoading, setOrgLoading] = useState(true);
  const [orgError, setOrgError] = useState(false);

  const [form, setForm] = useState({
    name: "",
    height_cm: "",
    position: "guard" as Position,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getOrganizationInfo(slug)
      .then((info) => {
        setOrgName(info.name);
        setOrgLoading(false);
      })
      .catch(() => {
        setOrgError(true);
        setOrgLoading(false);
      });
  }, [slug]);

  const isFormValid = form.name.trim() !== "" && form.height_cm !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await publicCreatePlayer(slug, {
        name: form.name,
        height_cm: parseFloat(form.height_cm),
        position: form.position,
      });
      setSuccess(true);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as {
          response?: { data?: Record<string, string[]> | { detail?: string } };
        };
        const data = axiosErr.response?.data;
        if (data && "detail" in data) {
          setError(data.detail as string);
        } else if (data) {
          const messages = Object.values(data).flat().join(" ");
          setError(messages);
        } else {
          setError("Erro ao cadastrar.");
        }
      } else {
        setError("Erro ao cadastrar.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (orgLoading) {
    return (
      <Box className="flex justify-center py-12">
        <CircularProgress sx={{ color: "white" }} />
      </Box>
    );
  }

  if (orgError) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <Typography variant="h5" className="font-bold">
            Organização não encontrada
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Verifique se o link está correto.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <CheckCircleOutlineIcon
            sx={{ fontSize: 64, color: "success.main" }}
          />
          <Typography variant="h5" className="font-bold">
            Cadastro enviado!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Aguarde a aprovação do administrador da organização{" "}
            <strong>{orgName}</strong>.
          </Typography>
          <Button
            variant="outlined"
            onClick={() => {
              setSuccess(false);
              setForm({ name: "", height_cm: "", position: "guard" });
            }}
          >
            Cadastrar outro jogador
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-4 sm:p-6">
        <Box className="mb-6 flex flex-col items-center">
          <EmojiEventsIcon
            sx={{ fontSize: 48, color: "secondary.main", mb: 1 }}
          />
          <Typography variant="h5" className="font-bold">
            {orgName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cadastre-se como jogador
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextField
            label="Nome"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
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
            required
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
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading || !isFormValid}
            fullWidth
          >
            {loading ? "Enviando..." : "Cadastrar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
