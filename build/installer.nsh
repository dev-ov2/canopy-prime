!macro customUnInstall
  ${ifNot} ${isUpdated}
    SetShellVarContext current
    Delete "$LOCALAPPDATA\Canopy\*.*"
    RMDir /r "$LOCALAPPDATA\Canopy"

    Delete "$APPDATA\Canopy\*.*"
    RMDir /r "$APPDATA\Canopy"  
  ${endIf}
!macroend
