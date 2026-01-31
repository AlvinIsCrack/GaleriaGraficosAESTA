import MaterialSymbolsLocalFireDepartmentRounded from "./icons/MaterialSymbolsLocalFireDepartmentRounded";

export default function Header() {
    return <>
        <header id="main-header">
            <div id="header-logo">
                <MaterialSymbolsLocalFireDepartmentRounded />
            </div>

            <div id="header-title">
                <h1>Incendios</h1>
                <p>A lo largo de Chile</p>
            </div>

            <div id="header-info">
                <p>Realizado para desafío AESTA.</p>
                <p>Hecho por <span className="ml-1 font-mono opacity-60 font-medium tracking-tight">Lucas Enríquez</span></p>
            </div>
        </header>
    </>
}