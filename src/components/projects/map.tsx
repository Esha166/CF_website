"use client";

import { useState, useMemo } from "react";
import {
    ComposableMap,
    Geographies,
    Geography,
    Marker,
    createCoordinates,
} from "@vnedyalk0v/react19-simple-maps";
import GEO_DATA from "@/data/pakistan-provinces.json";

interface ProjectPin {
    id: string;
    coordinates: [number, number];
    label: string;
}

function ringArea(ring: number[][]): number {
    let area = 0;
    for (let i = 0, len = ring.length, j = len - 1; i < len; j = i++) {
        area += (ring[j][0] - ring[i][0]) * (ring[j][1] + ring[i][1]);
    }
    return area;
}
function rewindRing(ring: number[][], cw: boolean): number[][] {
    if ((ringArea(ring) > 0) !== cw) ring.reverse();
    return ring;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rewindGeoJSON(geojson: any): any {
    const g = JSON.parse(JSON.stringify(geojson));
    for (const f of g.features) {
        const { type, coordinates: c } = f.geometry;
        if (type === "Polygon") {
            rewindRing(c[0], false);
            for (let i = 1; i < c.length; i++) rewindRing(c[i], true);
        } else if (type === "MultiPolygon") {
            for (const poly of c) {
                rewindRing(poly[0], false);
                for (let i = 1; i < poly.length; i++) rewindRing(poly[i], true);
            }
        }
    }
    return g;
}

const GEO_STYLE = {
    default: { outline: "none" },
    hover: { outline: "none" },
    pressed: { outline: "none" },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GeoType = any;

const isLg = () => typeof window !== "undefined" && window.innerWidth >= 1024;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const posFromEvent = (e: any) => {
    const rect = (e.currentTarget as Element).getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top - 100 };
};

interface AchievementsMapProps {
    projects: Array<{
        id: string;
        title: string;
        location: string;
        coordinates: string;
    }>;
    activeId: string | null;
    onSelect: (id: string) => void;
}

export default function AchievementsMap({ projects, activeId, onSelect }: AchievementsMapProps) {
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
    const geoData = useMemo(() => rewindGeoJSON(GEO_DATA), []);

    const pins: ProjectPin[] = useMemo(() => {
        return projects
            .filter((p) => p.coordinates)
            .map((p) => {
                const parts = p.coordinates.split(",").map(Number);
                if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) return null;
                return {
                    id: p.id,
                    coordinates: [parts[1], parts[0]] as [number, number],
                    label: p.title,
                };
            })
            .filter((p): p is ProjectPin => p !== null);
    }, [projects]);

    const displayId = hoveredId ?? activeId;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleMarkerClick = (pin: ProjectPin, e: any) => {
        e.stopPropagation();
        onSelect(pin.id);
        setTooltipPos(posFromEvent(e));
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleMarkerEnter = (pin: ProjectPin, e: any) => {
        if (!isLg()) return;
        setHoveredId(pin.id);
        setTooltipPos(posFromEvent(e));
    };

    const handleMarkerLeave = () => {
        if (!isLg()) return;
        setHoveredId(null);
        setTooltipPos(null);
    };

    return (
        <section
            className="w-full mx-auto px-6 py-10 md:py-16 flex flex-col justify-center"
            onClick={() => {
                if (!isLg()) {
                    setHoveredId(null);
                    setTooltipPos(null);
                }
                const el = document.activeElement as HTMLElement | null;
                el?.blur?.();
            }}
        >
            <h2 className="text-gray-900 font-bold text-3xl md:text-4xl text-center mb-2">
                Achievements
            </h2>

            <div className="w-full flex justify-center mt-8">
                <div
                    className="relative rounded-3xl overflow-hidden border-8 border-none"
                    style={{
                        transform: "perspective(1200px) rotateX(4deg) rotateZ(-4deg)",
                        width: "100%",
                        maxWidth: "1000px",
                    }}
                >
                    <ComposableMap
                        projection="geoMercator"
                        projectionConfig={{ center: createCoordinates(70, 30), scale: 1900 }}
                        width={1000}
                        height={600}
                        style={{
                            width: "100%",
                            height: "auto",
                            background: "transparent",
                            userSelect: "none",
                            WebkitUserSelect: "none",
                            outline: "none",
                        } as React.CSSProperties}
                    >
                        {/* ── 3D shadow layer ── */}
                        <g transform="translate(-6, 18)">
                            <Geographies geography={geoData}>
                                {({ geographies }: { geographies: GeoType }) =>
                                    geographies.map((geo: GeoType) => (
                                        <Geography
                                            key={`shadow-${geo.properties?.shapeID ?? geo.rsmKey}`}
                                            geography={geo}
                                            fill="#9ca3af"
                                            stroke="#9ca3af"
                                            strokeWidth={1}
                                            tabIndex={-1}
                                            style={GEO_STYLE}
                                        />
                                    ))
                                }
                            </Geographies>
                        </g>

                        {/* ── Main map layer ── */}
                        <Geographies geography={geoData}>
                            {({ geographies }: { geographies: GeoType }) =>
                                geographies.map((geo: GeoType) => (
                                    <Geography
                                        key={geo.properties?.shapeID ?? geo.rsmKey}
                                        geography={geo}
                                        fill="#e5e7eb"
                                        stroke="#ffffff"
                                        strokeWidth={1.5}
                                        tabIndex={-1}
                                        style={{
                                            default: { outline: "none", fill: "#e5e7eb" },
                                            hover: { outline: "none", fill: "#d1d5db" },
                                            pressed: { outline: "none", fill: "#e5e7eb" },
                                        }}
                                    />
                                ))
                            }
                        </Geographies>

                        {/* ── Markers ── */}
                        {pins.map((pin) => (
                            <Marker
                                key={pin.id}
                                coordinates={createCoordinates(pin.coordinates[0], pin.coordinates[1])}
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                onClick={(e: any) => handleMarkerClick(pin, e)}
                            >
                                <g
                                    transform="translate(-12, -28)"
                                    style={{ cursor: "pointer", userSelect: "none", outline: "none" }}
                                    tabIndex={-1}
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    onMouseEnter={(e: any) => handleMarkerEnter(pin, e)}
                                    onMouseLeave={handleMarkerLeave}
                                >
                                    {/* Drop shadow */}
                                    <ellipse
                                        cx={12} cy={29} rx={4} ry={1.5}
                                        fill="#00000033"
                                    />
                                    {/* Pin body — teardrop, tip at (12,28) */}
                                    <path
                                        d="M 12 28 C 6 22, 4 16, 4 10 A 8 8 0 1 1 20 10 C 20 16, 18 22, 12 28 Z"
                                        fill={pin.id === displayId ? "#b91c1c" : "#ef4444"}
                                        stroke="#fff"
                                        strokeWidth={1.5}
                                    />
                                    {/* Inner white dot */}
                                    <circle
                                        cx={12} cy={10} r={3.5}
                                        fill="#fff"
                                        opacity={0.9}
                                    />
                                </g>
                            </Marker>
                        ))}
                    </ComposableMap>
                </div>
            </div>

            {/* ── Tooltip (rendered outside the map so it's never clipped) ── */}
            {displayId !== null && tooltipPos && (
                <div
                    className="fixed pointer-events-none z-50"
                    style={{
                        left: tooltipPos.x,
                        top: tooltipPos.y,
                        transform: "translateX(-50%)",
                    }}
                >
                    <div className="bg-secondary-600 text-white rounded-lg px-4 py-3 shadow-xl min-w-max whitespace-nowrap border-2 border-secondary-700">
                        <p className="text-sm font-semibold text-center">
                            {pins.find((p) => p.id === displayId)?.label}
                        </p>
                    </div>
                    {/* Arrow */}
                    <div
                        className="absolute left-1/2 -translate-x-1/2"
                        style={{
                            bottom: -10,
                            borderLeft: "10px solid transparent",
                            borderRight: "10px solid transparent",
                            borderTop: "10px solid var(--secondary-600)",
                        }}
                    />
                </div>
            )}

        </section>
    );
}
