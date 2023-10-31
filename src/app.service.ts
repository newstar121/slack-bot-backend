import { Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'

@Injectable()
export class AppService {
  constructor(private readonly httpService: HttpService) {}

  allOk(): string {
    return 'All OK!'
  }

  async getImagesFromPexels(keyword: string, orientation: any) {
    try {

      const apiKeys = [
        '2sRVPCo9m1VUaiKbSRsNJr4GED2F4cj4c8UPjeUDr6nvayJsLFSdrLoM', //main
        'XrlanNuKbSXYeeT4azyu2xBiCsuhKrYWfSYot0c6VARNaiqN3lcctxPW', 
        'usz7cxRU7CKAHCKALP2T2dI73ARvQmfxk4y2QC0scGW2Lb1Sx3C6T6wZ', 
        '6hAY7FgFHD41dm81wWpuc04EKrZickm2gPKH7dYaF4Y5xp6otxm0l0QQ']

      const getRandomApiKey = () => {
        const randomIndex = Math.floor(Math.random() * apiKeys.length)
        return apiKeys[randomIndex]
      }

      const response = await this.httpService.axiosRef.get(
      `https://api.pexels.com/v1/search?query=${keyword}&orientation=${orientation}`,
        {
          headers: {
          Authorization: getRandomApiKey()
          }
        }
      )

    return response.data.photos.map(photo => photo.src.large)

    } catch (error) {
      console.error('Pexels API Error: ', error)

     return [
        "https://images.pexels.com/photos/4271933/pexels-photo-4271933.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
        "https://images.pexels.com/photos/4271933/pexels-photo-4271933.jpeg?auto=compress&cs=tinysrgb&h=650&w=940&v=2",
        "https://images.pexels.com/photos/4271933/pexels-photo-4271933.jpeg?auto=compress&cs=tinysrgb&h=650&w=940&v=3",
        "https://images.pexels.com/photos/4271933/pexels-photo-4271933.jpeg?auto=compress&cs=tinysrgb&h=650&w=940&v=4",
        "https://images.pexels.com/photos/4271933/pexels-photo-4271933.jpeg?auto=compress&cs=tinysrgb&h=650&w=940&v=5",
        "https://images.pexels.com/photos/4271933/pexels-photo-4271933.jpeg?auto=compress&cs=tinysrgb&h=650&w=940&v=6",
        "https://images.pexels.com/photos/4271933/pexels-photo-4271933.jpeg?auto=compress&cs=tinysrgb&h=650&w=940&v=7",
        "https://images.pexels.com/photos/4271933/pexels-photo-4271933.jpeg?auto=compress&cs=tinysrgb&h=650&w=940&v=8",
        "https://images.pexels.com/photos/4271933/pexels-photo-4271933.jpeg?auto=compress&cs=tinysrgb&h=650&w=940&v=9",
        "https://images.pexels.com/photos/4271933/pexels-photo-4271933.jpeg?auto=compress&cs=tinysrgb&h=650&w=940&v=10",
        "https://images.pexels.com/photos/4271933/pexels-photo-4271933.jpeg?auto=compress&cs=tinysrgb&h=650&w=940&v=11",
        "https://images.pexels.com/photos/4271933/pexels-photo-4271933.jpeg?auto=compress&cs=tinysrgb&h=650&w=940&v=12",
        "https://images.pexels.com/photos/4271933/pexels-photo-4271933.jpeg?auto=compress&cs=tinysrgb&h=650&w=940&v=13",
        "https://images.pexels.com/photos/4271933/pexels-photo-4271933.jpeg?auto=compress&cs=tinysrgb&h=650&w=940&v=14"
      ];
    }

  }
}
