import axios from "axios";
import { useEffect, useState } from "react";
import style from "./page.module.scss";
import Image from "next/image";
import ShareImage from "../components/ShareImage";

// アイコン素材
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faXmark,
  faCircleDown,
  faCircleUp,
  faList
} from "@fortawesome/free-solid-svg-icons";

interface MultiSearchResponse {
  results: MultiSearchResult[];
}
interface MultiSearchResult {
  adult: boolean;
  backdrop_path?: string;
  id: number;
  title?: string;
  name?: string;
  original_language: string;
  original_title?: string;
  original_name?: string;
  overview: string;
  poster_path?: string;
  media_type: string;
  genre_ids: number[];
  popularity: number;
  release_date?: string;
  first_air_date?: string;
  video?: boolean;
  vote_average: number;
  vote_count: number;
  origin_country?: string[];
  results: MultiSearchResult[];
  // Personに関連する追加フィールド
  gender?: number;
  known_for_department?: string;
  profile_path?: string;
  known_for?: MultiSearchResult[]; // 再帰的に同じ型を使用
}

interface Movie {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
}

export default function MoviePage() {
  const [search, setSearch] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovies, setSelectedMovies] = useState<Movie[]>([]);
  const [showSelectedList, setShowSelectedList] = useState(false);
  const [showShareImage, setShowShareImage] = useState(false);
  const [selectedMovieTitles, setSelectedMovieTitles] = useState<string[]>([]);
  const [showSearchModule, setShowSearchModule] = useState(true);
  const [movieImageUrls, setMovieImageUrls] = useState<string[]>([]); // 映画の画像URLの配列の状態

  // 検索ロジック
  useEffect(() => {
    if (search) {
      const searchKatakana = toKatakana(search);
      const multiSearchURLHiragana = `/api/3/search/multi?api_key=${
        process.env.NEXT_PUBLIC_TMDB_API_KEY
      }&language=ja&query=${encodeURIComponent(search)}`;
      const multiSearchURLKatakana = `/api/3/search/multi?api_key=${
        process.env.NEXT_PUBLIC_TMDB_API_KEY
      }&language=ja&query=${encodeURIComponent(searchKatakana)}`;

      Promise.all([
        axios.get<MultiSearchResponse>(multiSearchURLHiragana),
        axios.get<MultiSearchResponse>(multiSearchURLKatakana)
      ])
        .then(([responseHiragana, responseKatakana]) => {
          const resultsHiragana = responseHiragana.data.results;
          const resultsKatakana = responseKatakana.data.results;

          const combinedResults = [...resultsHiragana, ...resultsKatakana];
          const uniqueResults = Array.from(
            new Set(combinedResults.map((item) => item.id))
          )
            .map((id) => combinedResults.find((item) => item.id === id))
            .filter((item) => item !== undefined) as MultiSearchResult[]; // undefinedをフィルタリング

          // 映画やTVシリーズに加えて、人物に関連する作品も抽出
          const relatedMoviesAndTVShows = uniqueResults.flatMap((item) => {
            if (item.media_type === "movie" || item.media_type === "tv") {
              return [item];
            } else if (item.media_type === "person" && item.known_for) {
              return item.known_for.filter(
                (kf) => kf.media_type === "movie" || kf.media_type === "tv"
              );
            } else {
              return [];
            }
          });

          setMovies(relatedMoviesAndTVShows);
        })
        .catch((error) => console.error(error));
    }
  }, [search]);

  //ひらがな→カタカナ変換用関数s
  function toKatakana(str: String) {
    return str.replace(/[\u3041-\u3096]/g, function (match) {
      var char = match.charCodeAt(0) + 0x60;
      return String.fromCharCode(char);
    });
  }

  // 検索窓をクリアする
  const clearSearch = () => {
    setSearch("");
  };

  const handleMovieSelect = (movie: Movie) => {
    if (selectedMovies.find((m) => m.id === movie.id)) {
      setSelectedMovies(selectedMovies.filter((m) => m.id !== movie.id));
    } else {
      if (selectedMovies.length >= 15) {
        alert("選択できるのは15件までです");
      } else {
        setSelectedMovies([...selectedMovies, movie]);
      }
    }
  };

  // 選択解除処理
  const handleRemoveMovie = (movieId: number) => {
    const updatedSelectedMovies = selectedMovies.filter(
      (m) => m.id !== movieId
    );
    setSelectedMovies(updatedSelectedMovies);

    // 選択件数が0になったらモーダルを閉じる
    if (updatedSelectedMovies.length === 0) {
      handleCloseSelectedList();
    }
  };

  // 全ての選択を解除する処理
  const handleRemoveAllMovies = () => {
    if (window.confirm("全て選択解除してリセットしますか？")) {
      setSelectedMovies([]);
      handleCloseSelectedList();
    }
  };

  // 選択中の映画の順番を変更する処理
  const moveMovie = (movieId: number, direction: -1 | 1) => {
    const index = selectedMovies.findIndex((movie) => movie.id === movieId);
    if (index === -1) return;

    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= selectedMovies.length) return;

    const newMovies = [...selectedMovies];
    [newMovies[index], newMovies[newIndex]] = [
      newMovies[newIndex],
      newMovies[index]
    ];
    setSelectedMovies(newMovies);
  };

  const handleShowSelectedList = () => {
    setShowSelectedList(true);
  };

  const handleCloseSelectedList = () => {
    setShowSelectedList(false);
  };

  // 画像パスが存在するかどうかの確認
  const getImageUrl = (posterPath: String) => {
    return posterPath ? `poster/t/p/w200/${posterPath}` : "images/dummy.png"; // ダミー画像のパス
  };

  // 共有するボタンをクリックした際の処理
  const handleShareClick = () => {
    // 選択中の映画のタイトルを設定（空のタイトルは「（タイトルなし）」で置き換える）
    setSelectedMovieTitles(
      selectedMovies
        .slice(0, 10)
        .map((movie) => movie.title || movie.name || "（タイトルなし）")
    );

    // 選択中の映画の画像URLを設定（上位10件のみ）
    const urls = selectedMovies
      .slice(0, 10)
      .map((movie) => getImageUrl(movie.poster_path || ""));

    setMovieImageUrls(urls);

    setShowShareImage(true);
    setShowSelectedList(false); // 選択中リストのモジュールを閉じる
    setShowSearchModule(false); // 検索モジュールを非表示にする
  };

  // 選び直すボタンの処理
  const handleEditList = () => {
    setShowShareImage(false);
    setShowSelectedList(true); // 選択中リストのモジュールを閉じる
    setShowSearchModule(true);
  };

  return (
    <>
      <main className={style.searchPage}>
        {showShareImage && (
          <div className={style.shareImagewrapper}>
            <ShareImage
              movieImageUrls={movieImageUrls}
              movieTitles={selectedMovieTitles}
            />
            <button onClick={handleEditList} className={style.editList}>
              <FontAwesomeIcon icon={faArrowLeft} className={style.icon} />
              編集
            </button>
          </div>
        )}
        <h1>⭐️🎞️わたしの2023映画ベスト10🍿⭐️</h1>
        {showSearchModule && ( // 検索モジュールの表示/非表示を制御
          <div className={style.searchModule}>
            <div className={style.textInputWrapper}>
              <div className={style.searchContainer}>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="タイトルを入力"
                  className={style.textInput}
                />
                {search && (
                  <button onClick={clearSearch}>
                    <FontAwesomeIcon icon={faXmark} className={style.icon} />
                  </button>
                )}
              </div>
              {selectedMovies.length > 0 && (
                <button
                  onClick={handleShowSelectedList}
                  className={`${style.movieCountButton} ${
                    selectedMovies.length >= 11 ? style.textRed : ""
                  }`}>
                  {selectedMovies.length}件選択中
                  <FontAwesomeIcon icon={faList} className={style.icon} />
                </button>
              )}
            </div>
            {movies.length > 0 ? (
              <ul className={style.movieList}>
                {movies.map((movie) => (
                  <li
                    key={movie.id}
                    onClick={() => handleMovieSelect(movie)}
                    className={
                      selectedMovies.find((m) => m.id === movie.id)
                        ? style.selected
                        : ""
                    }>
                    <div className={style.movieText}>
                      <p className={style.movieTitle}>
                        {movie.title || movie.name || "（タイトルなし）"}
                      </p>
                      {selectedMovies.find((m) => m.id === movie.id) && (
                        <p className={style.selectedText}>選択中</p>
                      )}
                    </div>
                    <Image
                      src={getImageUrl(movie.poster_path || "")}
                      alt={movie.title || movie.name || "（タイトルなし）"}
                      width={165}
                      height={247}
                      unoptimized
                    />
                  </li>
                ))}
              </ul>
            ) : (
              search && <p className={style.emptyText}>検索結果は0件です</p>
            )}
          </div>
        )}
        {showSelectedList && (
          <div className={style.selectedListModalWrapper}>
            <div className={style.selectedListModal}>
              <button
                className={style.modalCloseButton}
                onClick={handleCloseSelectedList}>
                <FontAwesomeIcon icon={faXmark} className={style.icon} />
              </button>
              <div className={style.selectedListModalHeader}>
                <p className={style.selectedCount}>
                  {selectedMovies.length}件/10件選択中
                </p>
                <button
                  className={style.removeAllButton}
                  onClick={handleRemoveAllMovies}>
                  リセット
                </button>
              </div>
              <ul className={style.selectedList}>
                {selectedMovies.map((movie, index) => (
                  <li
                    key={movie.id}
                    className={index >= 10 ? style.notRanked : ""}>
                    <div className={style.sortButtons}>
                      <button onClick={() => moveMovie(movie.id, -1)}>
                        <FontAwesomeIcon
                          icon={faCircleUp}
                          className={style.icon}
                        />
                      </button>
                      <button onClick={() => moveMovie(movie.id, 1)}>
                        <FontAwesomeIcon
                          icon={faCircleDown}
                          className={style.icon}
                        />
                      </button>
                    </div>
                    <p className={style.selectedTitle}>
                      {movie.title || movie.name || "（タイトルなし）"}
                    </p>
                    <button
                      className={style.removeButton}
                      onClick={() => handleRemoveMovie(movie.id)}>
                      <FontAwesomeIcon icon={faXmark} className={style.icon} />
                    </button>
                  </li>
                ))}
              </ul>
              <div className={style.buttonWrapper}>
                <button
                  onClick={handleCloseSelectedList}
                  className={style.chooseAgainButton}>
                  選択に戻る
                </button>
                <button
                  onClick={handleShareClick}
                  disabled={selectedMovies.length < 10}
                  className={style.generateButton}>
                  画像を生成
                  <FontAwesomeIcon icon={faArrowRight} className={style.icon} />
                  {selectedMovies.length < 10 && (
                    <span>※10件以上選択してください</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        <div className={style.credit}>
          movie database by
          <Image src="/icon/tmdb_logo.svg" alt="TMDB" width={80} height={10} />
        </div>
      </main>
    </>
  );
}
