import {kernel} from 'firmament-vita';

import {ServiceManager} from './services/interfaces/service-manager';
import {ServiceManagerImpl} from './services/implementations/service-manager-impl';
import {InitializeDatabase} from './services/interfaces/initialize-database';
import {InitializeDatabaseImpl} from './services/implementations/initialize-database-impl';
import {BaseService} from './services/interfaces/base-service';
import {BaseServiceImpl} from './services/implementations/base-service-impl';
import {FolderMonitor} from "./services/interfaces/folder-monitor";
import {FolderMonitorImpl} from "./services/implementations/folder-monitor-impl";
import {DbMonitorImpl} from "./services/implementations/db-monitor-impl";
import {DbMonitor} from "./services/interfaces/db-monitor";
import {Loopback} from "./services/interfaces/loopback";
import {LoopbackImpl} from "./services/implementations/loopback-impl";
import {EtlFileImpl} from "./models/implementations/etl-file-impl";
import {EtlFlowImpl} from "./models/implementations/etl-flow-impl";
import {EtlTaskImpl} from "./models/implementations/etl-task-impl";
import {EtlStepImpl} from "./models/implementations/etl-step-impl";
import {EtlErrorImpl} from "./models/implementations/etl-error-impl";
import {EtlFile, EtlFlow, EtlTask, EtlStep, EtlError} from "../node_modules/etl-typings/index";

kernel.bind<BaseService>('BaseService').to(BaseServiceImpl).inSingletonScope();
kernel.bind<ServiceManager>('ServiceManager').to(ServiceManagerImpl).inSingletonScope();
kernel.bind<InitializeDatabase>('InitializeDatabase').to(InitializeDatabaseImpl).inSingletonScope();
kernel.bind<FolderMonitor>('FolderMonitor').to(FolderMonitorImpl).inSingletonScope();
kernel.bind<DbMonitor>('DbMonitor').to(DbMonitorImpl).inSingletonScope();
kernel.bind<Loopback>('Loopback').to(LoopbackImpl).inSingletonScope();
kernel.bind<EtlFile>('EtlFile').to(EtlFileImpl);
kernel.bind<EtlFlow>('EtlFlow').to(EtlFlowImpl);
kernel.bind<EtlTask>('EtlTask').to(EtlTaskImpl);
kernel.bind<EtlStep>('EtlStep').to(EtlStepImpl);
kernel.bind<EtlError>('EtlError').to(EtlErrorImpl);

export default kernel;
