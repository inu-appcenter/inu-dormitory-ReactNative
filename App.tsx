import React, { useEffect, useRef, useState } from "react";
import { Platform, BackHandler, ToastAndroid, Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView, WebViewNavigation } from "react-native-webview";
import * as Notifications from 'expo-notifications';

export default function App() {
    const [lastBackPress, setLastBackPress] = useState<number | null>(null);
    const backPressDelay = 2000;
    const webviewRef = useRef<WebView>(null);
    const [canGoBack, setCanGoBack] = useState<boolean>(false);
    const [currentUrl, setCurrentUrl] = useState<string>("https://inu-dormitory-web.pages.dev/home");
    const [previousPath, setPreviousPath] = useState<string | null>(null);

    // 안드로이드 하드웨어 뒤로가기 처리
    useEffect(() => {
        const onBackPress = (): boolean => {
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
                    BackHandler.exitApp();
                    return true;
                } else {
                    if (Platform.OS === "android") {
                        ToastAndroid.show("한 번 더 뒤로가기를 누르면 종료됩니다.", ToastAndroid.SHORT);
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

        const backHandlerListener = BackHandler.addEventListener("hardwareBackPress", onBackPress);
        return () => backHandlerListener.remove();
    }, [lastBackPress, currentUrl, canGoBack]);

    // Expo FCM 토큰 발급 및 서버 전송
    const issueFcmTokenAndPost = async () => {
        try {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                console.warn("⚠️ 알림 권한 없음");
                return;
            }

            const tokenData = await Notifications.getExpoPushTokenAsync();
            const token = tokenData.data;
            console.log("📌 발급된 FCM 토큰:", token);

            await fetch("https://portal.inuappcenter.kr/api/tokens", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
            });
            console.log("✅ FCM 토큰 서버 전송 완료");
        } catch (error) {
            console.log("FCM 처리 실패:", error);
        }
    };

    // WebView 내 경로 변경 감지
    const handleRouteChange = (url: string) => {
        const path = new URL(url).pathname;

        if (previousPath === "/m/login" && path === "/m/home") {
            console.log("🎉 로그인 후 홈 이동 감지");
            webviewRef.current?.injectJavaScript(`
        (function() {
          const tokenInfo = window.localStorage.getItem('tokenInfo');
          window.ReactNativeWebView.postMessage(JSON.stringify({ tokenInfo }));
        })();
        true;
      `);
        }

        setPreviousPath(path);
    };

    return (
        <SafeAreaView style={styles.container}>
            <WebView
                ref={webviewRef}
                source={{ uri: "https://inu-dormitory-web.pages.dev" }}
                style={styles.webview}
                onNavigationStateChange={(navState: WebViewNavigation) => {
                    setCanGoBack(navState.canGoBack);
                    setCurrentUrl(navState.url);
                    handleRouteChange(navState.url);
                }}
                onMessage={(event) => {
                    try {
                        const data = JSON.parse(event.nativeEvent.data);
                        if (data.tokenInfo) {
                            const tokenObj = JSON.parse(data.tokenInfo);
                            if (tokenObj.accessToken) {
                                console.log("✅ accessToken 존재:", tokenObj.accessToken.substring(0, 10), "…");
                                issueFcmTokenAndPost();
                            } else {
                                console.log("⚠️ tokenInfo는 있으나 accessToken 없음");
                            }
                        } else {
                            console.log("⚠️ tokenInfo 없음");
                        }
                    } catch (error) {
                        console.log("❌ tokenInfo 파싱 오류:", error);
                    }
                }}
                keyboardDisplayRequiresUserAction={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    webview: { flex: 1 },
});
