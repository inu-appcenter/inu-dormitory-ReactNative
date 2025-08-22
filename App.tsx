import React, { useEffect, useRef, useState } from "react";
import {
  BackHandler,
  Platform,
  StyleSheet,
  ToastAndroid,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { StatusBar } from "expo-status-bar";
import { WebViewNavigation } from "react-native-webview/lib/WebViewTypes";

export default function App() {
  const [lastBackPress, setLastBackPress] = useState<number | null>(null);
  const backPressDelay = 2000; // 2초
  const webviewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState<boolean>(false);
  const [currentUrl, setCurrentUrl] = useState<string>(
    "https://inu-dormitory-web.pages.dev/home"
  );

  useEffect(() => {
    const onBackPress = (): boolean => {
      const exitPaths: string[] = [
        "https://inu-dormitory-web.pages.dev/home",
        "https://inu-dormitory-web.pages.dev/roommate",
        "https://inu-dormitory-web.pages.dev/groupPurchase",
        "https://inu-dormitory-web.pages.dev/chat",
        "https://inu-dormitory-web.pages.dev/mypage",
      ];

      if (exitPaths.includes(currentUrl)) {
        const now = Date.now();
        if (lastBackPress && now - lastBackPress < backPressDelay) {
          BackHandler.exitApp();
          return true;
        } else {
          if (Platform.OS === "android") {
            ToastAndroid.show(
              "한 번 더 뒤로가기를 누르면 종료됩니다.",
              ToastAndroid.SHORT
            );
          } else {
            Alert.alert("앱 종료", "한 번 더 뒤로가기를 누르면 종료됩니다.");
          }
          setLastBackPress(now);
          return true;
        }
      } else if (canGoBack) {
        webviewRef.current?.goBack();
        return true;
      } else {
        BackHandler.exitApp();
        return true;
      }
    };

    const backHandlerListener = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    return () => backHandlerListener.remove();
  }, [lastBackPress, currentUrl, canGoBack]);

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        ref={webviewRef}
        source={{ uri: "https://inu-dormitory-web.pages.dev" }}
        style={styles.webview}
        onNavigationStateChange={(navState: WebViewNavigation) => {
          setCanGoBack(navState.canGoBack);
          setCurrentUrl(navState.url);
        }}
        keyboardDisplayRequiresUserAction={false}
      />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});
