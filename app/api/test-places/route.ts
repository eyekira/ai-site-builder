const MOCK_PLACES = [
  { id: 'place_1', name: '을지로 김밥천국', address: '서울 중구 을지로 123' },
  { id: 'place_2', name: '강남 파스타 하우스', address: '서울 강남구 테헤란로 45' },
  { id: 'place_3', name: '홍대 스시바', address: '서울 마포구 와우산로 22' },
  { id: 'place_4', name: '부산 해운대 밀면', address: '부산 해운대구 우동 777' },
  { id: 'place_5', name: '제주 흑돼지 식당', address: '제주 제주시 애월읍 88' },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get('input')?.trim().toLowerCase() ?? '';

  const results = input
    ? MOCK_PLACES.filter(
        (place) =>
          place.name.toLowerCase().includes(input) ||
          (place.address ?? '').toLowerCase().includes(input),
      )
    : [];

  return Response.json({ results });
}
