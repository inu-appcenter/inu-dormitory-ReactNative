package com.hjunieee.inudormitory

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import android.os.Process

class AppExitModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "AppExitModule"
    }

    @ReactMethod
    fun exitApp() {
        Process.killProcess(Process.myPid())
        System.exit(0)
    }
}
