'use client';

import { useState, useEffect, useMemo } from 'react';
import { matrix, tasks } from '@/lib/values';

// Вспомогательные функции для расчётов (из оригинала)
const stringSum = (number: number) => number.toString().split('').reduce(
  (accumulator, currentValue) => accumulator + parseInt(currentValue, 10),
  0
);

const splitInt = (value: string | number) => value
  .toString()
  .replace(/\./g, '')
  .split('')
  .map(x => parseInt(x));

// Функция получения значения матрицы (из оригинала)
const getMatrixValue = (fullArray: number[], number: number): string => {
  if (!fullArray.length) {
    return '—';
  }
  const filteredArray = fullArray.filter(x => x === number);
  let valueString;
  if (filteredArray.length > 5) {
    valueString = filteredArray.slice(5).join('');
  } else if (filteredArray.length === 0) {
    valueString = `${number}0`;
  } else {
    valueString = filteredArray.join('');
  }
  return matrix[valueString] || '—';
};

// Получить строку чисел для ячейки матрицы
const getCellNumbers = (fullArray: number[], cellNumber: number, yearDate: number): string => {
  const filteredArray = fullArray.filter(x => x === cellNumber);
  
  // Добавляем дополнительную 9 для годов >= 2020
  if (cellNumber === 9 && yearDate >= 2020) {
    filteredArray.push(9);
  }
  
  if (filteredArray.length === 0) {
    return '—';
  }
  
  return filteredArray.join(' ');
};

export default function Home() {
  const [date, setDate] = useState('');
  const [error, setError] = useState('');
  const [isOffline, setIsOffline] = useState(() => !navigator.onLine);

  // Регистрация Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration.scope);
        })
        .catch((error) => {
          console.log('SW registration failed:', error);
        });
    }

    // Проверка статуса соединения
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Логика расчёта (из оригинала) - useMemo вместо useEffect
  const calculatedValues = useMemo(() => {
    if (!date) {
      return { yearDate: 0, secondNumber: '', fourthNumber: '', numberArray: [] as number[], fullArray: [] as number[] };
    }

    // Форматирование даты в DD.MM.YYYY
    const dateObj = new Date(date);
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    const formattedDate = `${day}.${month}.${year}`;

    const numbers = splitInt(formattedDate);

    const first = numbers.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0
    );
    const second = stringSum(first);
    const third = year >= 2000
      ? first + 19
      : first - ((numbers[0] !== 0 ? numbers[0] : numbers[1]) * 2);
    const fourth = stringSum(third);

    let numberArray: number[];
    let fullArray: number[];

    if (year >= 2000) {
      numberArray = [first, second, 19, third, fourth];
      fullArray = [...numbers, ...splitInt(first), ...splitInt(second), ...splitInt(19), ...splitInt(third), ...splitInt(fourth)];
    } else {
      numberArray = [first, second, third, fourth];
      fullArray = [...numbers, ...splitInt(first), ...splitInt(second), ...splitInt(third), ...splitInt(fourth)];
    }

    return {
      yearDate: year,
      secondNumber: second.toString(),
      fourthNumber: fourth.toString(),
      numberArray,
      fullArray
    };
  }, [date]);

  const { yearDate, secondNumber, fourthNumber, numberArray, fullArray } = calculatedValues;

  // Матрица 3x3 (порядок из оригинала)
  const matrixLayout = [
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9]
  ];

  return (
    <>
      {/* Офлайн индикатор */}
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white text-center py-1 text-sm z-50">
          Офлайн режим
        </div>
      )}

      {/* Container maxWidth="sm" - верхняя часть */}
      <div className="max-w-sm mx-auto my-4 px-4">
        <div className="space-y-4">
          {/* Дата рождения */}
          <h6 className="text-base font-normal" style={{ fontFamily: 'Roboto, sans-serif' }}>
            Дата рождения
          </h6>
          <input
            id="date"
            type="date"
            value={date}
            onChange={e => {
              setDate(e.target.value);
              setError(e.target.validationMessage);
            }}
            className="w-full border-b border-gray-400 py-2 text-base focus:outline-none focus:border-indigo-500 transition-colors"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          />
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {/* Доп. числа */}
          <h6 className="text-base font-normal" style={{ fontFamily: 'Roboto, sans-serif' }}>
            Доп. числа:
            <span className="text-indigo-500 ml-1 font-normal text-base">
              {numberArray.join('.')}
            </span>
          </h6>

          {/* Матрица */}
          <h6 className="text-base font-normal" style={{ fontFamily: 'Roboto, sans-serif' }}>
            Матрица
          </h6>

          {/* Таблица матрицы с крупными числами */}
          <table className="w-full border-collapse">
            <tbody>
              {matrixLayout.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, colIndex) => {
                    const isTop = rowIndex === 0;
                    const isBottom = rowIndex === 2;
                    const isLeft = colIndex === 0;
                    const isRight = colIndex === 2;
                    const cellNumbers = getCellNumbers(fullArray, cell, yearDate);
                    const hasNumbers = cellNumbers !== '—';

                    return (
                      <td
                        key={colIndex}
                        className="border border-black relative"
                        style={{
                          borderTopWidth: isTop ? 0 : 1,
                          borderBottomWidth: isBottom ? 0 : 1,
                          borderLeftWidth: isLeft ? 0 : 1,
                          borderRightWidth: isRight ? 0 : 1,
                          width: '33.33%',
                        }}
                      >
                        <div className="relative pb-[100%]">
                          {/* Номер ячейки (1-9) - маленький, серый, в левом верхнем углу */}
                          <span 
                            className="absolute top-1 left-1 text-gray-400 text-sm"
                            style={{ fontFamily: 'Roboto, sans-serif' }}
                          >
                            {cell}
                          </span>
                          
                          {/* Рачетные числа - крупные, яркие, по центру */}
                          <div
                            className="absolute inset-0 flex items-center justify-center p-1"
                            style={{ fontFamily: 'Roboto, sans-serif' }}
                          >
                            <span 
                              className={`text-2xl font-bold ${hasNumbers ? 'text-indigo-600' : 'text-gray-300'}`}
                            >
                              {cellNumbers}
                            </span>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Container maxWidth="md" - результаты (как в оригинале) */}
      {!!fullArray.length && (
        <div className="max-w-md mx-auto my-4 px-4">
          <div className="space-y-4">
            {/* Личная задача Души */}
            <h6 className="text-base font-normal" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Личная задача Души
            </h6>
            <p
              className="text-base whitespace-pre-wrap"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              {secondNumber ? tasks[secondNumber] : null}
            </p>

            {/* Родовая задача. ЧРП */}
            <h6 className="text-base font-normal" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Родовая задача. ЧРП
            </h6>
            <p
              className="text-base whitespace-pre-wrap"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              {fourthNumber ? tasks[fourthNumber] : null}
            </p>

            {/* Значения матрицы */}
            <h6 className="text-base font-normal" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Значения матрицы
            </h6>

            {/* Значения для каждой цифры 1-9 с полными интерпретациями */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => {
              const matrixValue = getMatrixValue(fullArray, digit);
              const count = fullArray.filter(x => x === digit).length;
              
              return (
                <div key={digit} className="mb-4">
                  <p className="text-sm font-medium mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    <strong>Значение цифры {digit}</strong>
                    {count > 0 && (
                      <span className="text-indigo-600 ml-2">
                        ({count} {count === 1 ? 'шт' : count < 5 ? 'шт' : 'шт'})
                      </span>
                    )}
                  </p>
                  <p
                    className="text-base whitespace-pre-wrap leading-relaxed"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    {matrixValue}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
