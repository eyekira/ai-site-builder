const MOCK_PLACES = [
  { place_id: 'place_1', name: 'Euljiro Kimbap Heaven', address: '123 Euljiro, Jung-gu, Seoul' },
  { place_id: 'place_2', name: 'Gangnam Pasta House', address: '45 Teheran-ro, Gangnam-gu, Seoul' },
  { place_id: 'place_3', name: 'Hongdae Sushi Bar', address: '22 Wausan-ro, Mapo-gu, Seoul' },
  { place_id: 'place_4', name: 'Haeundae Wheat Noodles', address: '777 Udong, Haeundae-gu, Busan' },
  { place_id: 'place_5', name: 'Jeju Black Pork Grill', address: '88 Aewol-eup, Jeju-si, Jeju' },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get('input')?.trim().toLowerCase() ?? '';

  const results = input
    ? MOCK_PLACES.filter(
        (place) =>
          place.name.toLowerCase().includes(input) ||
          place.address.toLowerCase().includes(input),
      )
    : [];

  return Response.json({ results });
}
