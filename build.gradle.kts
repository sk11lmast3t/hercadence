tasks.register("assembleDebug") {
    doLast {
        println("Web app assembleDebug handled via npm/vite")
    }
}

tasks.register("lintDebug") {
    doLast {
        println("Web app lintDebug handled via npm/tsc")
    }
}

tasks.register("assemble") {
    doLast {
        println("Web app assemble handled via npm")
    }
}

tasks.register("build") {
    doLast {
        println("Web app build handled via npm")
    }
}

tasks.register("lint") {
    doLast {
        println("Web app lint handled via npm")
    }
}

tasks.register("check") {
    doLast {
        println("Web app check handled via npm")
    }
}
