export interface MapDataResponse {
    id: string;
    region: string;
    name: string;
    image: string;
    rangeUnitsToPixels: number;
    duLimit: number;
}

export default class MapData {
    id: string;
    region: string;
    name: string;
    image: string;
    rangeUnitsToPixels: number;
    duLimit: number;

    constructor(data: MapDataResponse) {
        this.populate(data);
    }

    protected populate(data: MapDataResponse): void {
        this.id = data.id;
        this.region = data.region;
        this.name = data.name;
        this.image = data.image;
        this.rangeUnitsToPixels = data.rangeUnitsToPixels;
        this.duLimit = data.duLimit;
    }
}
