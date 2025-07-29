import React, { useEffect, useRef, useState } from "react";
import {
  NativeModules,
  BackHandler,
  Platform,
  StyleSheet,
  ToastAndroid,
} from "react-native";
const { AppExitModule } = NativeModules;

if (!AppExitModule) {
  console.warn("AppExitModule is null or undefined");
}

import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { StatusBar } from "expo-status-bar";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function App() {
  const [lastBackPress, setLastBackPress] = useState<number | null>(null);
  const backPressDelay = 2000; // 2초
  const webviewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    const onBackPress = () => {
      const exitPaths = [
        "https://inu-dormitory-web.pages.dev/home",
        "https://inu-dormitory-web.pages.dev/roommate",
        "https://inu-dormitory-web.pages.dev/groupPurchase",
        "https://inu-dormitory-web.pages.dev/chat",
        "https://inu-dormitory-web.pages.dev/mypage",
      ];

      if (exitPaths.includes(currentUrl)) {
        const now = Date.now();
        if (lastBackPress && now - lastBackPress < backPressDelay) {
          AppExitModule.exitApp(); // 네이티브 모듈 호출해서 완전 종료
          return true;
        } else {
          ToastAndroid.show(
            "한 번 더 뒤로가기를 누르면 종료됩니다.",
            ToastAndroid.SHORT
          );
          setLastBackPress(now);
          return true;
        }
      } else if (canGoBack) {
        webviewRef.current?.goBack();
        return true;
      } else {
        AppExitModule.exitApp(); // 완전 종료
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
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flex: 1 }}
      enableOnAndroid={true}
      keyboardShouldPersistTaps="handled"
    >
      <SafeAreaView style={styles.container}>
        <WebView
          ref={webviewRef}
          source={{ uri: "https://inu-dormitory-web.pages.dev" }}
          style={styles.webview}
          onNavigationStateChange={(navState) => {
            setCanGoBack(navState.canGoBack);
            setCurrentUrl(navState.url);
          }}
          keyboardDisplayRequiresUserAction={false}
          allowsBackForwardNavigationGestures={true}
        />
        <StatusBar style="auto" />
      </SafeAreaView>
    </KeyboardAwareScrollView>
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
