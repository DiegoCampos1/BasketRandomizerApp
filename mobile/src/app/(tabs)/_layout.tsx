import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";

import { useNotificationSocket } from "@/hooks/notifications/useNotificationSocket";
import { colors, fonts } from "@/theme/tokens";

export default function TabsLayout() {
  const { t } = useTranslation("layout");
  useNotificationSocket();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bg.sunken,
          borderTopColor: colors.border.hairline,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: colors.brand[500],
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarLabelStyle: {
          fontFamily: fonts.semiBold,
          fontSize: 11,
          letterSpacing: 0.4,
        },
        sceneStyle: { backgroundColor: colors.bg.base },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("nav.dashboard"),
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="players"
        options={{
          title: t("nav.players"),
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="division"
        options={{
          title: t("nav.divideTeams"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="shuffle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t("nav.history"),
          tabBarIcon: ({ color, size }) => <Ionicons name="time" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
